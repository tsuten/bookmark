import React, { useMemo } from 'react';
import { useFind, useSubscribe } from 'meteor/react-meteor-data';
import { BookmarkItemsCollection } from '../api/bookmarkItems';

const uniqueTagsFromItems = (items) => {
  const set = new Set();
  for (const item of items) {
    for (const t of item.tags || []) {
      set.add(t);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b));
};

export const Sidebar = () => {
  const isLoading = useSubscribe('bookmarkTags');
  const itemsWithTags = useFind(() =>
    BookmarkItemsCollection.find({}, { fields: { tags: 1 } })
  );
  const bookmarkTags = useMemo(
    () => uniqueTagsFromItems(itemsWithTags),
    [itemsWithTags]
  );

  if (isLoading()) {
    return <div>Loading...</div>;
  }

  return (
    <div className="sidebar">
      <ul>
        {bookmarkTags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
    </div>
  );
};
