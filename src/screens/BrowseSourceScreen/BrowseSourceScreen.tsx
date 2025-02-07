import React, { useCallback, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';

import { FAB, Portal } from 'react-native-paper';
import Bottomsheet from 'rn-sliding-up-panel';
import {
  Container,
  LoadingScreenV2,
  LoadingMoreIndicator,
  ErrorScreenV2,
  SearchbarV2,
} from '@components/index';
import NovelList from '@components/NovelList';
import NovelCover from '@components/NovelCover';
import FilterBottomSheet from './components/BottomSheet';

import { useSearch } from '../../hooks';
import { useTheme } from '../../redux/hooks';
import { useBrowseSource, useSearchSource } from './useBrowseSource';
import { useLibrary } from '@hooks/reduxHooks';

import { LibraryNovelInfo } from '../../database/types';
import { SourceNovelItem } from '../../sources/types';
import { getString } from '@strings/translations';
import { StyleSheet } from 'react-native';

interface BrowseSourceScreenProps {
  route: {
    params: {
      sourceId: number;
      sourceName: string;
      url: string;
      showLatestNovels?: boolean;
    };
  };
}

const BrowseSourceScreen: React.FC<BrowseSourceScreenProps> = ({ route }) => {
  const theme = useTheme();
  const { navigate, goBack } = useNavigation();

  const {
    sourceId,
    sourceName,
    url: sourceUrl,
    showLatestNovels,
  } = route.params;

  const {
    isLoading,
    novels,
    hasNextPage,
    fetchNextPage,
    error,
    filterValues,
    setFilters,
    clearFilters,
  } = useBrowseSource(sourceId, showLatestNovels);

  const {
    isSearching,
    searchResults,
    searchSource,
    clearSearchResults,
    searchError,
  } = useSearchSource(sourceId);

  const novelList = searchResults.length > 0 ? searchResults : novels;
  const errorMessage = error || searchError;

  const { searchText, setSearchText, clearSearchbar } = useSearch();
  const onChangeText = (text: string) => setSearchText(text);
  const onSubmitEditing = () => searchSource(searchText);
  const handleClearSearchbar = () => {
    clearSearchbar();
    clearSearchResults();
  };

  const handleOpenWebView = async () => {
    WebBrowser.openBrowserAsync(sourceUrl);
  };

  const library = useLibrary();

  const novelInLibrary = (novelUrl: string) =>
    library?.some(
      (novel: LibraryNovelInfo) =>
        novel.novelUrl === novelUrl && novel.sourceId === sourceId,
    );

  const navigateToNovel = useCallback(
    (item: SourceNovelItem) =>
      navigate(
        'Novel' as never,
        {
          novelName: item.novelName,
          novelCover: item.novelCover,
          novelUrl: item.novelUrl,
          sourceId,
        } as never,
      ),
    [sourceId],
  );

  const filterSheetRef = useRef<Bottomsheet | null>(null);

  return (
    <Container>
      <SearchbarV2
        searchText={searchText}
        leftIcon="magnify"
        placeholder={`${getString('common.search')} ${sourceName}`}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        clearSearchbar={handleClearSearchbar}
        handleBackAction={goBack}
        rightIcons={[{ iconName: 'earth', onPress: handleOpenWebView }]}
        theme={theme}
      />
      {isLoading || isSearching ? (
        <LoadingScreenV2 theme={theme} />
      ) : errorMessage || novelList.length === 0 ? (
        <ErrorScreenV2
          error={errorMessage || getString('sourceScreen.noResultsFound')}
          theme={theme}
        />
      ) : (
        <NovelList
          data={novelList}
          renderItem={({ item }) => (
            <NovelCover
              item={item}
              theme={theme}
              libraryStatus={novelInLibrary(item.novelUrl)}
              onPress={() => navigateToNovel(item)}
            />
          )}
          onEndReached={() => {
            if (hasNextPage && !searchText) {
              fetchNextPage();
            }
          }}
          ListFooterComponent={
            hasNextPage && !searchText && <LoadingMoreIndicator theme={theme} />
          }
        />
      )}
      {!showLatestNovels && filterValues?.length ? (
        <>
          <FAB
            icon={'filter-variant'}
            style={[styles.filterFab, { backgroundColor: theme.colorAccent }]}
            label={'Filter'}
            uppercase={false}
            color={theme.colorButtonText}
            onPress={() => filterSheetRef?.current?.show()}
          />
          <Portal>
            <FilterBottomSheet
              filterSheetRef={filterSheetRef}
              filtersValues={filterValues}
              setFilters={setFilters}
              clearFilters={clearFilters}
            />
          </Portal>
        </>
      ) : null}
    </Container>
  );
};

export default BrowseSourceScreen;

const styles = StyleSheet.create({
  filterFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 16,
  },
});
