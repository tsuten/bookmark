import React from 'react';
import { Archive, Pencil, StickyNote } from 'lucide-react';
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

const archiveBookmarkItem = (bookmarkItem) => {
  Meteor.call('archiveBookmarkItem', { _id: bookmarkItem._id });
};

export const BookmarkItem = ({ bookmarkItem, onEdit }) => {
  const note = bookmarkItem.note?.trim();

  return (
    <li>
        <div className="group flex flex-row gap-2 hover:bg-gray-100 justify-between">
          <a href={bookmarkItem.url} target="_blank" rel="noreferrer">
            <div className="flex flex-col p-3">
                {bookmarkItem.title}
                <div className="flex flex-row gap-4 items-center">
                    <span className="text-sm text-gray-500">
                    {(bookmarkItem.tags || []).join(', ') || 'No tags'}
                    </span>
                    <span className="text-sm text-gray-500">
                    {bookmarkItem.url}
                    </span>
                    <span className="text-sm text-gray-500">
                    {formatCreatedAtLabel(bookmarkItem.createdAt)}
                    </span>
                    {note ? (
                      <span
                        className="inline-flex text-gray-400"
                        title={note}
                        aria-label="Has note"
                      >
                        <StickyNote className="w-3.5 h-3.5" aria-hidden />
                      </span>
                    ) : null}
                </div>
            </div>
          </a>
          <div className="hidden shrink-0 items-center gap-2 group-hover:flex">
              <button type="button" className="hover:bg-gray-200 p-2 rounded-sm text-blue-500" onClick={() => onEdit(bookmarkItem)}><Pencil className="w-4 h-4" /></button>
              {!bookmarkItem.is_archived ? (
                <button
                  type="button"
                  className="hover:bg-gray-200 p-2 rounded-sm text-gray-600"
                  aria-label="Archive"
                  onClick={() => archiveBookmarkItem(bookmarkItem)}
                >
                  <Archive className="w-4 h-4" />
                </button>
              ) : null}
          </div>
        </div>
    </li>
  );
};
