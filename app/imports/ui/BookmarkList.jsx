import React, { useState } from 'react';
import { useFind, useSubscribe } from 'meteor/react-meteor-data';
import { BookmarkItemsCollection } from '../api/bookmarkItems';
import { BookmarkItem } from './BookmarkItem.jsx';
import { Bookmark } from 'lucide-react';

export const BookmarkList = () => {
    const isLoading = useSubscribe('bookmarkItems');
    const bookmarkItems = useFind(() => BookmarkItemsCollection.find());

    if(isLoading()) {
        return <div>Loading...</div>;
    }

  return (
    <div>
        <div className="flex flex-row gap-2 items-center">
            <Bookmark className="w-4 h-4" />
            <h2>All Bookmarks</h2>
        </div>
      <ul>
        {bookmarkItems.map(
            bookmarkItem => <><BookmarkItem key={bookmarkItem._id} bookmarkItem={bookmarkItem} /> <hr/></>
        )}
      </ul>
    </div>
  );
};
