
import Foundation

import CoreData
import Models
import Services
import SwiftUI
import Utils
import Views

@MainActor final class LibraryItemFetcher: NSObject, ObservableObject {
  @Published var items = [Models.LibraryItem]()
  @Published var featureItems = [Models.LibraryItem]()

  private var fetchedResultsController: NSFetchedResultsController<Models.LibraryItem>?

  @AppStorage(UserDefaultKey.lastSelectedFeaturedItemFilter.rawValue) var featureFilter = FeaturedItemFilter.continueReading.rawValue

  var cursor: String?

  // These are used to make sure we handle search result
  // responses in the right order
  var searchIdx = 0
  var receivedIdx = 0

  func setItems(_ context: NSManagedObjectContext, _ items: [Models.LibraryItem]) {
    self.items = items
    if let filter = FeaturedItemFilter(rawValue: featureFilter) {
      updateFeatureFilter(context: context, filter: filter)
    }
  }

  func loadCurrentViewer(dataService: DataService) async {
    // Cache the viewer
    if dataService.currentViewer == nil {
      _ = try? await dataService.fetchViewer()
    }
  }

  func loadLabels(dataService: DataService) async {
    let fetchRequest: NSFetchRequest<Models.LinkedItemLabel> = LinkedItemLabel.fetchRequest()
    fetchRequest.fetchLimit = 1

    if (try? dataService.viewContext.count(for: fetchRequest)) == 0 {
      _ = try? await dataService.labels()
    }
  }

  func loadSearchQuery(dataService: DataService, filterState: FetcherFilterState, isRefresh: Bool, loadCursor: String? = nil) async {
    let thisSearchIdx = searchIdx
    searchIdx += 1

    if thisSearchIdx > 0, thisSearchIdx <= receivedIdx {
      return
    }

    let queryResult = try? await dataService.loadLinkedItems(
      limit: 10,
      searchQuery: searchQuery(filterState),
      cursor: isRefresh ? nil : loadCursor ?? cursor
    )

    if let appliedFilter = filterState.appliedFilter, let queryResult = queryResult {
      let newItems: [Models.LibraryItem] = {
        var itemObjects = [Models.LibraryItem]()
        dataService.viewContext.performAndWait {
          itemObjects = queryResult.itemIDs.compactMap { dataService.viewContext.object(with: $0) as? Models.LibraryItem }
        }
        return itemObjects
      }()

      if filterState.searchTerm.replacingOccurrences(of: " ", with: "").isEmpty, appliedFilter.allowLocalFetch {
        updateFetchController(dataService: dataService, filterState: filterState)
      } else {
        // Don't use FRC for searching. Use server results directly.
        if fetchedResultsController != nil {
          fetchedResultsController = nil
          setItems(dataService.viewContext, [])
        }
        setItems(dataService.viewContext, isRefresh ? newItems : items + newItems)
      }

      receivedIdx = thisSearchIdx
      cursor = queryResult.cursor
      if let username = dataService.currentViewer?.username {
        await dataService.prefetchPages(itemIDs: newItems.map(\.unwrappedID), username: username)
      }
    } else {
      updateFetchController(dataService: dataService, filterState: filterState)
    }
  }

  func loadItems(dataService: DataService, filterState: FetcherFilterState, isRefresh: Bool) async {
    await withTaskGroup(of: Void.self) { group in
      group.addTask { await self.loadCurrentViewer(dataService: dataService) }
      group.addTask { await self.loadLabels(dataService: dataService) }
      group.addTask { await self.updateFetchController(dataService: dataService, filterState: filterState) }
      await group.waitForAll()
    }

    if let appliedFilter = filterState.appliedFilter {
      let shouldRemoteSearch = items.count < 1 || isRefresh && appliedFilter.shouldRemoteSearch
      if shouldRemoteSearch {
        await loadSearchQuery(dataService: dataService, filterState: filterState, isRefresh: isRefresh)
      } else {
        updateFetchController(dataService: dataService, filterState: filterState)
      }
    }

    NotificationCenter.default.post(name: NSNotification.PerformSync, object: nil, userInfo: nil)

    BadgeCountHandler.updateBadgeCount(dataService: dataService)
  }

  func loadMoreItems(dataService: DataService, filterState: FetcherFilterState) async {
    if let appliedFilter = filterState.appliedFilter, appliedFilter.shouldRemoteSearch {
      let idx = max(items.count - 1, 0)
      await loadSearchQuery(dataService: dataService, filterState: filterState, isRefresh: false, loadCursor: idx.description)
    }
  }

  func loadFeatureItems(context: NSManagedObjectContext, predicate: NSPredicate, sort: NSSortDescriptor) async -> [Models.LibraryItem] {
    let fetchRequest: NSFetchRequest<Models.LibraryItem> = LibraryItem.fetchRequest()
    fetchRequest.fetchLimit = 25
    fetchRequest.predicate = predicate
    fetchRequest.sortDescriptors = [sort]

    return (try? context.fetch(fetchRequest)) ?? []
  }

  private func fetchRequest(_ filterState: FetcherFilterState) -> NSFetchRequest<Models.LibraryItem> {
    let fetchRequest: NSFetchRequest<Models.LibraryItem> = LibraryItem.fetchRequest()

    var subPredicates = [NSPredicate]()

    let folderPredicate = NSPredicate(
      format: "%K == %@", #keyPath(Models.LibraryItem.folder), filterState.folder
    )
    subPredicates.append(folderPredicate)

    if let predicate = filterState.appliedFilter?.predicate {
      subPredicates.append(predicate)
    }

    if !filterState.selectedLabels.isEmpty {
      var labelSubPredicates = [NSPredicate]()

      for label in filterState.selectedLabels {
        labelSubPredicates.append(
          NSPredicate(format: "SUBQUERY(labels, $label, $label.id == \"\(label.unwrappedID)\").@count > 0")
        )
      }

      subPredicates.append(NSCompoundPredicate(orPredicateWithSubpredicates: labelSubPredicates))
    }

    if !filterState.negatedLabels.isEmpty {
      var labelSubPredicates = [NSPredicate]()

      for label in filterState.negatedLabels {
        labelSubPredicates.append(
          NSPredicate(format: "SUBQUERY(labels, $label, $label.id == \"\(label.unwrappedID)\").@count == 0")
        )
      }

      subPredicates.append(NSCompoundPredicate(orPredicateWithSubpredicates: labelSubPredicates))
    }

    fetchRequest.predicate = NSCompoundPredicate(andPredicateWithSubpredicates: subPredicates)
    fetchRequest.sortDescriptors = (LinkedItemSort(rawValue: filterState.appliedSort) ?? .newest).sortDescriptors

    return fetchRequest
  }

  private func updateFetchController(dataService: DataService, filterState: FetcherFilterState) {
    fetchedResultsController = NSFetchedResultsController(
      fetchRequest: fetchRequest(filterState),
      managedObjectContext: dataService.viewContext,
      sectionNameKeyPath: nil,
      cacheName: nil
    )

    guard let fetchedResultsController = fetchedResultsController else {
      return
    }

    fetchedResultsController.delegate = self
    try? fetchedResultsController.performFetch()
    setItems(dataService.viewContext, fetchedResultsController.fetchedObjects ?? [])
  }

  private func searchQuery(_ filterState: FetcherFilterState) -> String {
    let sort = LinkedItemSort(rawValue: filterState.appliedSort) ?? .newest
    var query = ""

    if let queryString = filterState.appliedFilter?.filter {
      query = "\(queryString)"
    }

    if !query.contains("sort:") {
      query = "\(query) \(sort.queryString)"
    }

    if !filterState.searchTerm.isEmpty {
      query.append(" \(filterState.searchTerm)")
    }

    if !filterState.selectedLabels.isEmpty {
      query.append(" label:")
      query.append(filterState.selectedLabels.compactMap { label in
        if let name = label.name {
          return "\"\(name)\""
        }
        return nil
      }.joined(separator: ","))
    }

    if !filterState.negatedLabels.isEmpty {
      query.append(" !label:")
      query.append(filterState.negatedLabels.compactMap { label in
        if let name = label.name {
          return "\"\(name)\""
        }
        return nil
      }.joined(separator: ","))
    }

    query.append(" use:folders")
    print("QUERY: `\(query)`")

    return query
  }

  func refreshFeatureItems(dataService: DataService) {
    if let featureFilter = FeaturedItemFilter(rawValue: self.featureFilter) {
      updateFeatureFilter(context: dataService.viewContext, filter: featureFilter)
    }
  }

  func updateFeatureFilter(context: NSManagedObjectContext, filter: FeaturedItemFilter?) {
    if let filter = filter {
      Task {
        featureFilter = filter.rawValue

        featureItems = await loadFeatureItems(
          context: context,
          predicate: filter.predicate,
          sort: filter.sortDescriptor
        )
      }
    } else {
      featureItems = []
    }
  }
}

extension LibraryItemFetcher: NSFetchedResultsControllerDelegate {
  func controllerDidChangeContent(_ controller: NSFetchedResultsController<NSFetchRequestResult>) {
    setItems(controller.managedObjectContext, controller.fetchedObjects as? [Models.LibraryItem] ?? [])
  }
}
