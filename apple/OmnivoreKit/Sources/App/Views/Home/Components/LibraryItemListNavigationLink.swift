import Models
import Services
import SwiftUI
import Transmission
import Views

struct MacFeedCardNavigationLink: View {
  @EnvironmentObject var dataService: DataService
  @EnvironmentObject var audioController: AudioController

  let item: Models.LibraryItem

  @ObservedObject var viewModel: HomeFeedViewModel

  var body: some View {
    ZStack {
      LibraryItemCard(item: LibraryItemData.make(from: item), viewer: dataService.currentViewer)
      NavigationLink(destination: LinkItemDetailView(
        linkedItemObjectID: item.objectID,
        isPDF: item.isPDF
      ), label: {
        EmptyView()
      }).opacity(0)
    }
  }
}

struct LibraryItemListNavigationLink: View {
  @EnvironmentObject var dataService: DataService
  @EnvironmentObject var audioController: AudioController

  @ObservedObject var item: Models.LibraryItem
  @ObservedObject var viewModel: HomeFeedViewModel

  var body: some View {
    ZStack {
      LibraryItemCard(item: LibraryItemData.make(from: item), viewer: dataService.currentViewer)
      PresentationLink(
        transition: PresentationLinkTransition.slide(
          options: PresentationLinkTransition.SlideTransitionOptions(edge: .trailing,
                                                                     options:
                                                                     PresentationLinkTransition.Options(
                                                                       modalPresentationCapturesStatusBarAppearance: true
                                                                     ))),
        destination: {
          LinkItemDetailView(
            linkedItemObjectID: item.objectID,
            isPDF: item.isPDF
          )
        }, label: {
          EmptyView()
        }
      )
    }
  }
}

struct LibraryItemGridCardNavigationLink: View {
  @EnvironmentObject var dataService: DataService
  @EnvironmentObject var audioController: AudioController

  @State private var scale = 1.0

  @ObservedObject var item: Models.LibraryItem

  let actionHandler: (GridCardAction) -> Void

  @Binding var isContextMenuOpen: Bool

  @ObservedObject var viewModel: HomeFeedViewModel

  var body: some View {
    PresentationLink(
      transition: PresentationLinkTransition.slide(
        options: PresentationLinkTransition.SlideTransitionOptions(edge: .trailing,
                                                                   options:
                                                                   PresentationLinkTransition.Options(
                                                                     modalPresentationCapturesStatusBarAppearance: true
                                                                   ))),
      destination: {
        LinkItemDetailView(
          linkedItemObjectID: item.objectID,
          isPDF: item.isPDF
        )
      }, label: {
        GridCard(item: LibraryItemData.make(from: item), isContextMenuOpen: $isContextMenuOpen, actionHandler: actionHandler)
      }
    )
    .buttonStyle(.plain)
    .aspectRatio(1.0, contentMode: .fill)
    .background(
      Color.secondarySystemGroupedBackground
        .onTapGesture {
          if isContextMenuOpen {
            isContextMenuOpen = false
          }
        }
    )
    .cornerRadius(6)
  }
}
