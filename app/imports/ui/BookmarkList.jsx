import React, { useState } from 'react';
import { useFind, useSubscribe } from 'meteor/react-meteor-data';
import { BookmarkItemsCollection } from '../api/bookmarkItems';
import { BookmarkItem } from './BookmarkItem.jsx';
import { Bookmark, ChevronDown } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { DropdownMenu } from 'radix-ui';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'az', label: 'A-Z' },
  { value: 'za', label: 'Z-A' },
];

function sortOptionForMode(mode) {
  switch (mode) {
    case 'newest':
      return { createdAt: -1 };
    case 'oldest':
      return { createdAt: 1 };
    case 'az':
      return { title: 1 };
    case 'za':
      return { title: -1 };
    default:
      return { createdAt: -1 };
  }
}

export const BookmarkList = () => {
  const { tag } = useParams();
  const [sortBy, setSortBy] = useState('newest');
  const isLoading = useSubscribe('bookmarkItems');
  const bookmarkItems = useFind(
    () =>
      BookmarkItemsCollection.find(
        tag ? { tags: tag } : {},
        { sort: sortOptionForMode(sortBy) }
      ),
    [tag, sortBy]
  );

  const sortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Newest';

  if (isLoading()) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex flex-row gap-2 items-center justify-between">
        <div className="flex flex-row gap-2 items-center m-2">
          <Bookmark className="w-4 h-4" />
          <h2>{tag ? `Bookmarks by tag: ${tag}` : 'All Bookmarks'}</h2>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              {sortLabel}
              <ChevronDown aria-hidden />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content sideOffset={4}>
                <DropdownMenu.RadioGroup value={sortBy} onValueChange={setSortBy}>
                  {SORT_OPTIONS.map(({ value, label }) => (
                    <DropdownMenu.RadioItem key={value} value={value}>
                      {label}
                    </DropdownMenu.RadioItem>
                  ))}
                </DropdownMenu.RadioGroup>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
      <hr />
      <ul>
        {bookmarkItems.map((bookmarkItem) => (
          <React.Fragment key={bookmarkItem._id}>
            <BookmarkItem bookmarkItem={bookmarkItem} />
            <hr />
          </React.Fragment>
        ))}
      </ul>
    </div>
  );
};
