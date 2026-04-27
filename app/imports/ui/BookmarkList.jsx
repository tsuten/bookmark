import React from 'react';
import { useFind, useSubscribe } from 'meteor/react-meteor-data';
import { BookmarkItemsCollection } from '../api/bookmarkItems';
import { BookmarkItem } from './BookmarkItem.jsx';
import { Bookmark } from 'lucide-react';
import { useParams } from 'react-router-dom';

export const BookmarkList = () => {
  const { tag } = useParams();
  const isLoading = useSubscribe('bookmarkItems');
  const bookmarkItems = useFind(
    () =>
      tag
        ? BookmarkItemsCollection.find({ tags: tag })
        : BookmarkItemsCollection.find(),
    [tag]
  );

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
          Sort by:
          <select>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="az">A-Z</option>
            <option value="za">Z-A</option>
          </select>
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
