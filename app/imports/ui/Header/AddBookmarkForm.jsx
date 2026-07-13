import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { Plus } from 'lucide-react';
import {
  bookmarkUrlErrorMessage,
  validateHttpUrlString,
} from '../../api/bookmarkItems';

export const AddBookmarkForm = ({ className = '' }) => {
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  const handleUrlChange = (event) => {
    setUrl(event.target.value);
    if (urlError) setUrlError('');
  };

  const addBookmarkItem = () => {
    const result = validateHttpUrlString(url);
    if (!result.valid) {
      setUrlError(bookmarkUrlErrorMessage(result.errorCode));
      return;
    }
    Meteor.call('addBookmarkItem', { title: url.trimStart(), url: url.trim() });
    setUrl('');
    setUrlError('');
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`.trim()}>
      <div className="flex min-w-0 flex-row items-center">
        <input
          type="text"
          placeholder="Add a new bookmark"
          value={url}
          onChange={handleUrlChange}
          aria-invalid={urlError ? 'true' : 'false'}
          className="min-w-0 flex-1 rounded-r-none"
        />
        <button
          type="button"
          onClick={addBookmarkItem}
          className="rounded-l-none bg-blue-500 p-2 text-white"
          aria-label="Add bookmark"
        >
          <Plus className="size-4" />
        </button>
      </div>
      {urlError ? (
        <p className="text-sm text-red-600" role="alert">
          {urlError}
        </p>
      ) : null}
    </div>
  );
};
