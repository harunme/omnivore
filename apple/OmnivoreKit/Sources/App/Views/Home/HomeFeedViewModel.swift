import CoreData
import Models
import Services
import SwiftUI
import Utils
import Views

@MainActor final class HomeFeedViewModel: NSObject, ObservableObject, UINavigationControllerDelegate {
  let folder: String
  let fetcher: LibraryItemFetcher
  let listConfig: LibraryListConfig

  private var fetchedResultsController: NSFetchedResultsController<Models.LibraryItem>?

  @Published var isLoading = false
  @Published var showPushNotificationPrimer = false
  @Published var itemUnderLabelEdit: Models.LibraryItem?
  @Published var itemUnderTitleEdit: Models.LibraryItem?
  @Published var itemForHighlightsView: Models.LibraryItem?
  @Published var linkRequest: LinkRequest?
  @Published var presentWebContainer = false
  @Published var showLoadingBar = true

  @Published var selectedItem: Models.LibraryItem?
  @Published var linkIsActive = false

  @Published var showLabelsSheet = false
  @Published var showSnackbar = false
  @Published var snackbarOperation: SnackbarOperation?

  @Published var filters = [InternalFilter]()

  @Published var searchTerm = ""
  @Published var selectedLabels = [LinkedItemLabel]()
  @Published var negatedLabels = [LinkedItemLabel]()
  @Published var appliedSort = LinkedItemSort.newest.rawValue

  @State var lastMoreFetched: Date?

  @AppStorage(UserDefaultKey.hideFeatureSection.rawValue) var hideFeatureSection = false
  @AppStorage("LibraryTabView::hideFollowingTab") var hideFollowingTab = false

  @Published var appliedFilter: InternalFilter? {
    didSet {
      let filterKey = UserDefaults.standard.string(forKey: "lastSelected-\(folder)-filter") ?? folder
      UserDefaults.standard.setValue(appliedFilter?.name, forKey: filterKey)
    }
  }

  private var filterState: FetcherFilterState {
    FetcherFilterState(folder: folder, searchTerm: searchTerm, selectedLabels: selectedLabels, negatedLabels: negatedLabels, appliedSort: appliedSort, appliedFilter: appliedFilter)
  }

  init(folder: String, fetcher: LibraryItemFetcher, listConfig: LibraryListConfig) {
    self.folder = folder
    self.fetcher = fetcher
    self.listConfig = listConfig
    super.init()
  }

  func loadFilters(dataService: DataService) async {
    switch folder {
    case "following":
      updateFilters(newFilters: InternalFilter.DefaultFollowingFilters, defaultName: "following")
    default:
      var hasLocalResults = false
      let fetchRequest: NSFetchRequest<Models.Filter> = Filter.fetchRequest()

      // Load from disk
      if let results = try? dataService.viewContext.fetch(fetchRequest) {
        hasLocalResults = true
        updateFilters(newFilters: InternalFilter.make(from: results), defaultName: "inbox")
      }

      let hasResults = hasLocalResults
      Task.detached {
        if let downloadedFilters = try? await dataService.filters() {
          await self.updateFilters(newFilters: downloadedFilters, defaultName: "inbox")
        } else if !hasResults {
          await self.updateFilters(newFilters: InternalFilter.DefaultInboxFilters, defaultName: "inbox")
        }
      }
    }
  }

  func loadMore(dataService: DataService) async {
    if isLoading { return }

    let start = Date.now
    if let lastMoreFetched, lastMoreFetched.timeIntervalSinceNow > -4 {
      print("skipping fetching more as last fetch was too recent: ", lastMoreFetched)
      return
    }

    isLoading = true
    await fetcher.loadMoreItems(dataService: dataService, filterState: filterState)
    isLoading = false

    lastMoreFetched = start
  }

  func pushFeedItem(item _: Models.LibraryItem) {
    /// TODO: jackson
    //   fetcher.items.insert(item, at: 0)
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

  func updateFilters(newFilters: [InternalFilter], defaultName: String) {
    let appliedFilterName = UserDefaults.standard.string(forKey: "lastSelected-\(filterState.folder)-filter") ?? defaultName

    filters = newFilters
      .filter { $0.folder == filterState.folder }
      .sorted(by: { $0.position < $1.position })
      + (folder == "inbox" ? [InternalFilter.UnreadFilter, InternalFilter.DeletedFilter, InternalFilter.DownloadedFilter] : [InternalFilter.DownloadedFilter])

    if let newFilter = filters.first(where: { $0.name.lowercased() == appliedFilterName }), newFilter.id != appliedFilter?.id {
      appliedFilter = newFilter
    }
  }

  func loadItems(dataService: DataService, isRefresh: Bool) async {
    isLoading = true
    showLoadingBar = isRefresh

    await fetcher.loadItems(dataService: dataService, filterState: filterState, isRefresh: isRefresh)

    isLoading = false
    showLoadingBar = false
  }

  func loadFeatureItems(context: NSManagedObjectContext, predicate: NSPredicate, sort: NSSortDescriptor) async -> [Models.LibraryItem] {
    let fetchRequest: NSFetchRequest<Models.LibraryItem> = LibraryItem.fetchRequest()
    fetchRequest.fetchLimit = 25
    fetchRequest.predicate = predicate
    fetchRequest.sortDescriptors = [sort]

    do {
      let fetched = try context.fetch(fetchRequest)
      return fetched
    } catch {
      print("ERROR FETCHING: ", error)
    }
    return []
//    return (try? context.fetch(fetchRequest)) ?? []
  }

  func snackbar(_ message: String, undoAction: SnackbarUndoAction? = nil) {
    snackbarOperation = SnackbarOperation(message: message, undoAction: undoAction)
    showSnackbar = true
  }

  func setLinkArchived(dataService: DataService, objectID: NSManagedObjectID, archived: Bool) {
    dataService.archiveLink(objectID: objectID, archived: archived)
    snackbar(archived ? "Link archived" : "Link unarchived")
  }

  func removeLibraryItem(dataService: DataService, objectID: NSManagedObjectID) {
    removeLibraryItemAction(dataService: dataService, objectID: objectID)
  }

  func recoverItem(dataService: DataService, itemID: String) {
    Task {
      if await dataService.recoverItem(itemID: itemID) {
        snackbar("Item recovered")
      } else {
        snackbar("Error. Check trash to recover.")
      }
    }
  }

  func getOrCreateLabel(dataService: DataService, named: String, color: String) -> LinkedItemLabel? {
    if let label = LinkedItemLabel.named(named, inContext: dataService.viewContext) {
      return label
    }
    if let labelID = try? dataService.createLabel(name: named, color: color, description: "") {
      return dataService.viewContext.object(with: labelID) as? LinkedItemLabel
      // return LinkedItemLabel.lookup(byID: labelID, inContext: dataService.viewContext)
    }
    return nil
  }

  func addLabel(dataService: DataService, item: Models.LibraryItem, label: String, color: String) {
    if let label = getOrCreateLabel(dataService: dataService, named: "Pinned", color: color) {
      let existingLabels = item.labels?.allObjects.compactMap { $0 as? LinkedItemLabel } ?? []
      dataService.setItemLabels(itemID: item.unwrappedID, labels: InternalLinkedItemLabel.make(Set(existingLabels + [label]) as NSSet))

      item.update(inContext: dataService.viewContext)
      fetcher.refreshFeatureItems(dataService: dataService)
    }
  }

  func removeLabel(dataService: DataService, item: Models.LibraryItem, named: String) {
    let labels = item.labels?
      .filter { ($0 as? LinkedItemLabel)?.name != named }
      .compactMap { $0 as? LinkedItemLabel } ?? []
    dataService.setItemLabels(itemID: item.unwrappedID, labels: InternalLinkedItemLabel.make(Set(labels) as NSSet))
    item.update(inContext: dataService.viewContext)
  }

  func pinItem(dataService: DataService, item: Models.LibraryItem) {
    addLabel(dataService: dataService, item: item, label: "Pinned", color: "#0A84FF")
    fetcher.refreshFeatureItems(dataService: dataService)
  }

  func unpinItem(dataService: DataService, item: Models.LibraryItem) {
    removeLabel(dataService: dataService, item: item, named: "Pinned")
    fetcher.refreshFeatureItems(dataService: dataService)
  }

  func markRead(dataService: DataService, item: Models.LibraryItem) {
    dataService.updateLinkReadingProgress(itemID: item.unwrappedID, readingProgress: 100, anchorIndex: 0, force: true)
  }

  func markUnread(dataService: DataService, item: Models.LibraryItem) {
    dataService.updateLinkReadingProgress(itemID: item.unwrappedID, readingProgress: 0, anchorIndex: 0, force: true)
  }

  func moveToFolder(dataService: DataService, item: Models.LibraryItem, folder: String) {
    Task {
      do {
        try await dataService.moveItem(itemID: item.unwrappedID, folder: folder)
        snackbar("Item moved")
      } catch {
        snackbar("Error moving item to \(folder)")
      }
    }
  }

  func bulkAction(dataService: DataService, action: BulkAction, items: [String]) {
    if items.count < 1 {
      snackbar("No items selected")
      return
    }
    Task {
      do {
        try await dataService.bulkAction(action: action, items: items)
        snackbar("Operation completed")
      } catch {
        print("ERROR: ", error)
        snackbar("Error performing operation")
      }
    }
  }

  func findFilter(_: DataService, named: String) -> InternalFilter? {
    filters.first(where: { $0.name == named })
  }
}
