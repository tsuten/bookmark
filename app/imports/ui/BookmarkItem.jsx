import React from 'react';

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

export const BookmarkItem = ({ bookmarkItem }) => {
  return (
    <li>
      <a href={bookmarkItem.url} target="_blank">
        <div className="flex flex-col hover:bg-gray-100 p-3">
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
    </li>
  );
};
