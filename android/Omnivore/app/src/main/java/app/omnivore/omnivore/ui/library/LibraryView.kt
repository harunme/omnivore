package app.omnivore.omnivore.ui.library

import android.content.Intent
import android.util.Log
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.AnimationSpec
import androidx.compose.animation.core.FloatTweenSpec
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.material.DismissDirection
import androidx.compose.material.DismissState
import androidx.compose.material.FractionalThreshold
import androidx.compose.material.DismissValue
import androidx.compose.material.pullrefresh.PullRefreshIndicator
import androidx.compose.material.pullrefresh.pullRefresh
import androidx.compose.material.pullrefresh.rememberPullRefreshState
import androidx.compose.material.SwipeToDismiss
import androidx.compose.material.Icon
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Archive
import androidx.compose.material.icons.filled.Unarchive
import androidx.compose.material3.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.*
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import app.omnivore.omnivore.Routes
import app.omnivore.omnivore.persistence.entities.SavedItemLabel
import app.omnivore.omnivore.persistence.entities.SavedItemWithLabelsAndHighlights
import app.omnivore.omnivore.ui.components.AddLinkSheetContent
import app.omnivore.omnivore.ui.components.LabelsSelectionSheetContent
import app.omnivore.omnivore.ui.components.LabelsViewModel
import app.omnivore.omnivore.ui.editinfo.EditInfoSheetContent
import app.omnivore.omnivore.ui.editinfo.EditInfoViewModel
import app.omnivore.omnivore.ui.savedItemViews.SavedItemCard
import app.omnivore.omnivore.ui.reader.PDFReaderActivity
import app.omnivore.omnivore.ui.reader.WebReaderLoadingContainerActivity
import app.omnivore.omnivore.ui.save.SaveState
import app.omnivore.omnivore.ui.save.SaveViewModel
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.launch


@OptIn(ExperimentalMaterialApi::class)
@Composable
fun LibraryView(
  libraryViewModel: LibraryViewModel,
  labelsViewModel: LabelsViewModel,
  saveViewModel: SaveViewModel,
  editInfoViewModel: EditInfoViewModel,
  navController: NavHostController
) {
  val scaffoldState: ScaffoldState = rememberScaffoldState()
  val showLabelsSelectionSheet: Boolean by libraryViewModel.showLabelsSelectionSheetLiveData.observeAsState(false)
  val showAddLinkSheet: Boolean by libraryViewModel.showAddLinkSheetLiveData.observeAsState(false)
  val showEditInfoSheet: Boolean by libraryViewModel.showEditInfoSheetLiveData.observeAsState(false)

  val coroutineScope = rememberCoroutineScope()
  val modalBottomSheetState = rememberModalBottomSheetState(
    ModalBottomSheetValue.Hidden,
    confirmStateChange = { it != ModalBottomSheetValue.Hidden }
  )

  if (showLabelsSelectionSheet || showAddLinkSheet || showEditInfoSheet) {
    coroutineScope.launch {
      modalBottomSheetState.show()
    }
  } else {
    coroutineScope.launch {
      modalBottomSheetState.hide()
    }
  }

  libraryViewModel.snackbarMessage?.let {
    coroutineScope.launch {
      scaffoldState.snackbarHostState.showSnackbar(it)
      libraryViewModel.clearSnackbarMessage()
    }
  }

  ModalBottomSheetLayout(
    sheetBackgroundColor = Color.Transparent,
    sheetState = modalBottomSheetState,
    sheetContent = {
      BottomSheetContent(libraryViewModel, labelsViewModel, saveViewModel,editInfoViewModel)
      Spacer(modifier = Modifier.weight(1.0F))
    }
  ) {
    Scaffold(
      scaffoldState = scaffoldState,
      topBar = {
        LibraryNavigationBar(
          savedItemViewModel = libraryViewModel,
          onSearchClicked = { navController.navigate(Routes.Search.route) },
          onAddLinkClicked = { libraryViewModel.showAddLinkSheetLiveData.value = true },
          onSettingsIconClick = { navController.navigate(Routes.Settings.route) }
        )
      },
    ) { paddingValues ->
      LibraryViewContent(
        libraryViewModel,
        modifier = Modifier
          .padding(top = paddingValues.calculateTopPadding())
      )
    }
  }
}

@Composable
fun BottomSheetContent(libraryViewModel: LibraryViewModel,
                       labelsViewModel: LabelsViewModel,
                       saveViewModel: SaveViewModel,
                       editInfoViewModel: EditInfoViewModel
) {
  val showLabelsSelectionSheet: Boolean by libraryViewModel.showLabelsSelectionSheetLiveData.observeAsState(false)
  val showAddLinkSheet: Boolean by libraryViewModel.showAddLinkSheetLiveData.observeAsState(false)
  val showEditInfoSheet: Boolean by libraryViewModel.showEditInfoSheetLiveData.observeAsState(false)
  val currentSavedItemData = libraryViewModel.currentSavedItemUnderEdit()
  val labels: List<SavedItemLabel> by libraryViewModel.savedItemLabelsLiveData.observeAsState(listOf())

  if (showLabelsSelectionSheet) {
    BottomSheetUI {
      if (currentSavedItemData != null) {
        LabelsSelectionSheetContent(
          labels = labels,
          labelsViewModel = labelsViewModel,
          initialSelectedLabels = currentSavedItemData.labels,
          onCancel = {
            libraryViewModel.showLabelsSelectionSheetLiveData.value = false
            libraryViewModel.currentItemLiveData.value = null
          },
          isLibraryMode = false,
          onSave = {
            if (it != labels) {
              libraryViewModel.updateSavedItemLabels(
                savedItemID = currentSavedItemData.savedItem.savedItemId,
                labels = it
              )
            }
            libraryViewModel.currentItemLiveData.value = null
            libraryViewModel.showLabelsSelectionSheetLiveData.value = false
          },
          onCreateLabel = { newLabelName, labelHexValue ->
            libraryViewModel.createNewSavedItemLabel(newLabelName, labelHexValue)
          }
        )
      } else { // Is used in library mode
        LabelsSelectionSheetContent(
          labels = labels,
          labelsViewModel = labelsViewModel,
          initialSelectedLabels = libraryViewModel.activeLabelsLiveData.value ?: listOf(),
          onCancel = { libraryViewModel.showLabelsSelectionSheetLiveData.value = false },
          isLibraryMode = true,
          onSave = {
            libraryViewModel.updateAppliedLabels(it)
            libraryViewModel.currentItemLiveData.value = null
            libraryViewModel.showLabelsSelectionSheetLiveData.value = false
          },
          onCreateLabel = { newLabelName, labelHexValue ->
            libraryViewModel.createNewSavedItemLabel(newLabelName, labelHexValue)
          }
        )
      }
    }
  } else if (showAddLinkSheet) {
    BottomSheetUI {
      AddLinkSheetContent(
        viewModel = saveViewModel,
        onCancel = {
          libraryViewModel.showAddLinkSheetLiveData.value = false
          saveViewModel.state.value = SaveState.DEFAULT
        },
        onLinkAdded = {
          libraryViewModel.showAddLinkSheetLiveData.value = false
          saveViewModel.state.value = SaveState.DEFAULT
        }
      )
    }
  } else if (showEditInfoSheet) {
    BottomSheetUI {
      EditInfoSheetContent(
        savedItemId = currentSavedItemData?.savedItem?.savedItemId,
        title = currentSavedItemData?.savedItem?.title,
        author = currentSavedItemData?.savedItem?.author,
        description = currentSavedItemData?.savedItem?.descriptionText,
        viewModel = editInfoViewModel,
        onCancel = {
          libraryViewModel.showEditInfoSheetLiveData.value = false
          libraryViewModel.currentItemLiveData.value = null
        },
        onUpdated = {
          libraryViewModel.showEditInfoSheetLiveData.value = false
          libraryViewModel.currentItemLiveData.value = null
          libraryViewModel.refresh()
        }
      )
    }
  }
}

@OptIn(ExperimentalMaterialApi::class, ExperimentalMaterial3Api::class)
@Composable
fun LibraryViewContent(libraryViewModel: LibraryViewModel, modifier: Modifier) {
  val context = LocalContext.current
  val listState = rememberLazyListState()

  val pullRefreshState = rememberPullRefreshState(
    refreshing = libraryViewModel.isRefreshing,
    onRefresh = { libraryViewModel.refresh() }
  )

  val selectedItem: SavedItemWithLabelsAndHighlights? by libraryViewModel.actionsMenuItemLiveData.observeAsState()
  val cardsData: List<SavedItemWithLabelsAndHighlights> by libraryViewModel.itemsLiveData.observeAsState(
    listOf()
  )

  Box(
    modifier = Modifier
      .fillMaxSize()
      .pullRefresh(pullRefreshState)
  ) {

    LazyColumn(
      state = listState,
      verticalArrangement = Arrangement.Top,
      horizontalAlignment = Alignment.CenterHorizontally,
      modifier = modifier
        .background(MaterialTheme.colorScheme.background)
        .fillMaxSize()
        .padding(horizontal = 6.dp)
    ) {
      item {
        LibraryFilterBar(libraryViewModel)
      }
      items(
        items = cardsData,
        key = { item -> item.savedItem.savedItemId }
      ) { cardDataWithLabels ->
        val swipeThreshold = 0.40f

        val currentThresholdFraction = remember { mutableStateOf(0f) }
        val currentItem by rememberUpdatedState(cardDataWithLabels.savedItem)
        val swipeState = rememberDismissState(
          confirmStateChange = {
            if (it == DismissValue.DismissedToEnd ||
              currentThresholdFraction.value < swipeThreshold ||
              currentThresholdFraction.value > 1.0f) {
              false
            }

            if (it == DismissValue.DismissedToEnd) { // Archiving/UnArchiving.
              if (currentItem.isArchived) {
                libraryViewModel.unarchiveSavedItem(currentItem.savedItemId)
              } else {
                libraryViewModel.archiveSavedItem(currentItem.savedItemId)
              }
            } else if (it == DismissValue.DismissedToStart) { // Deleting.
              libraryViewModel.deleteSavedItem(currentItem.savedItemId)
            }

            true
          }
        )
        SwipeToDismiss(
          state = swipeState,
          modifier = Modifier.padding(vertical = 4.dp),
          directions = setOf(DismissDirection.StartToEnd, DismissDirection.EndToStart),
          dismissThresholds = { FractionalThreshold(swipeThreshold) },
          background = {
            val direction = swipeState.dismissDirection ?: return@SwipeToDismiss
            val color by animateColorAsState(
              when (swipeState.targetValue) {
                DismissValue.Default -> Color.LightGray
                DismissValue.DismissedToEnd -> Color.Green
                DismissValue.DismissedToStart -> Color.Red
              }, label = "backgroundColor"
            )
            val alignment = when (direction) {
              DismissDirection.StartToEnd -> Alignment.CenterStart
              DismissDirection.EndToStart -> Alignment.CenterEnd
            }
            val icon = when (direction) {
              DismissDirection.StartToEnd -> if (currentItem.isArchived) Icons.Default.Unarchive else Icons.Default.Archive
              DismissDirection.EndToStart -> Icons.Default.Delete
            }
            val scale by animateFloatAsState(
              if (swipeState.targetValue == DismissValue.Default) 0.75f else 1f,
              label = "scaleAnimation"
            )

            Box(
              Modifier.fillMaxSize().background(color).padding(horizontal = 20.dp),
              contentAlignment = alignment
            ) {
              currentThresholdFraction.value = swipeState.progress.fraction
              Icon(
                icon,
                contentDescription = null,
                modifier = Modifier.scale(scale)
              )
            }
          },
          dismissContent = {
            val selected = currentItem.savedItemId == selectedItem?.savedItem?.savedItemId
            SavedItemCard(
              selected = selected,
              savedItemViewModel = libraryViewModel,
              savedItem = cardDataWithLabels,
              onClickHandler = {
                libraryViewModel.actionsMenuItemLiveData.postValue(null)
                val activityClass =
                  if (currentItem.contentReader == "PDF") PDFReaderActivity::class.java else WebReaderLoadingContainerActivity::class.java
                val intent = Intent(context, activityClass)
                intent.putExtra("SAVED_ITEM_SLUG", currentItem.slug)
                context.startActivity(intent)
              },
              actionHandler = {
                libraryViewModel.handleSavedItemAction(
                  currentItem.savedItemId,
                  it
                )
              }
            )
          },
        )
        when {
          swipeState.isDismissed(DismissDirection.EndToStart) -> Reset(state = swipeState)
          swipeState.isDismissed(DismissDirection.StartToEnd) -> Reset(state = swipeState)
        }
      }
    }

    InfiniteListHandler(listState = listState) {
      if (cardsData.isEmpty()) {
        Log.d("sync", "loading with load func")
        libraryViewModel.initialLoad()
      } else {
        Log.d("sync", "loading with search api")
        libraryViewModel.loadUsingSearchAPI()
      }
    }

    PullRefreshIndicator(
      refreshing = libraryViewModel.isRefreshing,
      state = pullRefreshState,
      modifier = Modifier.align(Alignment.TopCenter)
    )

    // LabelsSelectionSheet(viewModel = libraryViewModel)
  }
}

@OptIn(ExperimentalMaterialApi::class)
@Composable
private fun Reset(state: DismissState) {
  val scope = rememberCoroutineScope()
  LaunchedEffect(key1 = state.dismissDirection) {
    scope.launch {
      state.reset()
      state.animateTo(DismissValue.Default, FloatTweenSpec(duration= 0, delay = 0))
    }
  }
}

@Composable
private fun BottomSheetUI(content: @Composable () -> Unit) {
  Box(
    modifier = Modifier
      .wrapContentHeight()
      .fillMaxWidth()
      .clip(RoundedCornerShape(topEnd = 20.dp, topStart = 20.dp))
      .background(Color.White)
      .statusBarsPadding()
  ) {
    content()
  }
}


@Composable
fun InfiniteListHandler(
  listState: LazyListState,
  buffer: Int = 2,
  onLoadMore: () -> Unit
) {
  val loadMore = remember {
    derivedStateOf {
      val layoutInfo = listState.layoutInfo
      val totalItemsNumber = layoutInfo.totalItemsCount
      val lastVisibleItemIndex = (layoutInfo.visibleItemsInfo.lastOrNull()?.index ?: 0) + 1

      lastVisibleItemIndex > (totalItemsNumber - buffer)
    }
  }

  LaunchedEffect(loadMore) {
    snapshotFlow { loadMore.value }
      .distinctUntilChanged()
      .collect {
        onLoadMore()
      }
  }
}
