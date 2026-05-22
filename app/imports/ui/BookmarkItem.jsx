import React from 'react';
import { Pencil, Trash } from 'lucide-react';
import { Meteor } from 'meteor/meteor';

const formatCreatedAtLabel = (createdAt) => {
  const d = createdAt instanceof Date ? createdAt : new Date(createdAt);
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (isToday) {
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
};

const deleteBookmarkItem = (bookmarkItem) => {
  Meteor.call('deleteBookmarkItem', { _id: bookmarkItem._id });
}

export const BookmarkItem = ({ bookmarkItem }) => {
  return (
    <li>
        <div className="group flex flex-row gap-2 hover:bg-gray-100 justify-between">
          <a href={bookmarkItem.url} target="_blank">
            <div className="flex flex-col p-3">
                {bookmarkItem.title}
                <div className="flex flex-row gap-4">
                    <span className="text-sm text-gray-500">
                    {(bookmarkItem.tags || []).join(', ') || 'No tags'}
                    </span>
                    <span className="text-sm text-gray-500">
                    {bookmarkItem.url}
                    </span>
                    <span className="text-sm text-gray-500">
                    {formatCreatedAtLabel(bookmarkItem.createdAt)}
                    </span>
                </div>
            </div>
          </a>
          <div className="hidden shrink-0 items-center gap-2 group-hover:flex">
              <button type="button" className="hover:bg-gray-200 p-2 rounded-sm text-blue-500"><Pencil className="w-4 h-4" /></button>
              <button type="button" className="hover:bg-gray-200 p-2 rounded-sm text-red-500" onClick={() => deleteBookmarkItem(bookmarkItem)}><Trash className="w-4 h-4" /></button>
          </div>
        </div>
    </li>
  );
};
