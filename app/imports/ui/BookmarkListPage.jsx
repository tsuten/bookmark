import React, { useMemo } from 'react';
import { useFind } from 'meteor/react-meteor-data';
import { useOutletContext, useParams } from 'react-router-dom';
import { BookmarkItemsCollection } from '../api/bookmarkItems';
import { BookmarkList } from './BookmarkList.jsx';

const activeBookmarkQuery = { is_archived: { $ne: true } };
const archivedBookmarkQuery = { is_archived: true };

const uncategorizedBookmarkQuery = {
  ...activeBookmarkQuery,
  $or: [{ tags: { $exists: false } }, { tags: { $size: 0 } }],
};

const BookmarkListPage = ({ title, query }) => {
  const { isBookmarksLoading = false, searchText = '' } = useOutletContext() ?? {};
  const bookmarkItems = useFind(
    () => BookmarkItemsCollection.find(query),
    [query]
  );
  const normalizedSearchText = searchText.trim().toLowerCase();
  const filteredBookmarkItems = useMemo(() => {
    if (!normalizedSearchText) {
      return bookmarkItems;
    }
    return bookmarkItems.filter((bookmarkItem) => {
      const title = (bookmarkItem.title || '').toLowerCase();
      const url = (bookmarkItem.url || '').toLowerCase();
      return title.includes(normalizedSearchText) || url.includes(normalizedSearchText);
    });
  }, [bookmarkItems, normalizedSearchText]);

  return (
    <BookmarkList
      title={title}
      bookmarkItems={filteredBookmarkItems}
      isLoading={isBookmarksLoading}
      searchText={searchText}
      totalBookmarkCount={bookmarkItems.length}
    />
  );
};

export const AllBookmarksPage = () => (
  <BookmarkListPage title="All Bookmarks" query={activeBookmarkQuery} />
);

export const ArchivedBookmarksPage = () => (
  <BookmarkListPage
    title="Archived Bookmarks"
    query={archivedBookmarkQuery}
  />
);

export const UncategorizedBookmarksPage = () => (
  <BookmarkListPage
    title="Uncategorized Bookmarks"
    query={uncategorizedBookmarkQuery}
  />
);

export const TaggedBookmarksPage = () => {
  const { tag } = useParams();
  const query = useMemo(
    () => ({ ...activeBookmarkQuery, tags: tag }),
    [tag]
  );

  return (
    <BookmarkListPage
      title={`Bookmarks by tag: ${tag}`}
      query={query}
    />
  );
};
