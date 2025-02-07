import React from 'react';

import { ProgressBar } from 'react-native-paper';

import { EmptyView, SearchbarV2 } from '@components/index';
import GlobalSearchResultsList from './components/GlobalSearchResultsList';

import useSearch from '@hooks/useSearch';
import { useTheme } from '@redux/hooks';
import { getString } from '@strings/translations';
import { useGlobalSearch } from './hooks/useGlobalSearch';

interface Props {
  route?: {
    params?: {
      searchText?: string;
    };
  };
}

const GlobalSearchScreen = (props: Props) => {
  const theme = useTheme();
  const { searchText, setSearchText, clearSearchbar } = useSearch(
    props?.route?.params?.searchText,
  );
  const onChangeText = (text: string) => setSearchText(text);
  const onSubmitEditing = () => globalSearch(searchText);

  const { searchResults, globalSearch, searchAllSources, progress } =
    useGlobalSearch({
      defaultSearchText: searchText,
    });

  return (
    <>
      <SearchbarV2
        searchText={searchText}
        placeholder={getString('browseScreen.globalSearch')}
        leftIcon="magnify"
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        clearSearchbar={clearSearchbar}
        theme={theme}
      />
      {progress ? (
        <ProgressBar color={theme.colorAccent} progress={progress} />
      ) : null}
      <GlobalSearchResultsList
        searchResults={searchResults}
        ListEmptyComponent={
          <EmptyView
            icon="__φ(．．)"
            description={`${getString('globalSearch.searchIn')} ${getString(
              searchAllSources
                ? 'globalSearch.allSources'
                : 'globalSearch.pinnedSources',
            )}`}
            theme={theme}
          />
        }
      />
    </>
  );
};

export default GlobalSearchScreen;
