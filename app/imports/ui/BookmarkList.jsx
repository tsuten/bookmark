import React, { useState } from 'react';
import { useFind, useSubscribe } from 'meteor/react-meteor-data';
import { BookmarkItemsCollection } from '../api/bookmarkItems';
import { BookmarkItem } from './BookmarkItem.jsx';
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Bookmark,
  ChevronDown,
  ClockArrowDown,
  ClockArrowUp,
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { DropdownMenu } from 'radix-ui';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest', Icon: ClockArrowDown },
  { value: 'oldest', label: 'Oldest', Icon: ClockArrowUp },
  { value: 'az', label: 'A-Z', Icon: ArrowUpAZ },
  { value: 'za', label: 'Z-A', Icon: ArrowDownAZ },
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

  const sortOption =
    SORT_OPTIONS.find((o) => o.value === sortBy) ?? SORT_OPTIONS[0];
  const { label: sortLabel, Icon: SortIcon } = sortOption;

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
              <SortIcon aria-hidden />
              {sortLabel}
              <ChevronDown aria-hidden />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content sideOffset={4}>
                <DropdownMenu.RadioGroup value={sortBy} onValueChange={setSortBy}>
                  {SORT_OPTIONS.map(({ value, label, Icon }) => (
                    <DropdownMenu.RadioItem key={value} value={value}>
                      <Icon aria-hidden className="w-4 h-4" />
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
