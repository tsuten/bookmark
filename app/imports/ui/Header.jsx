import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { Plus, Search, X } from 'lucide-react';
import { InputWithIcon } from './molecules/InputWithIcon';
import { UserMenu } from './UserMenu.jsx';
import {
  bookmarkUrlErrorMessage,
  validateHttpUrlString,
} from '../api/bookmarkItems';

const AddBookmarkForm = () => {
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
    <div className="flex flex-col gap-1">
      <div className="flex flex-row items-center">
        <input
          type="text"
          placeholder="Add a new bookmark"
          value={url}
          onChange={handleUrlChange}
          aria-invalid={urlError ? 'true' : 'false'}
          // className={
          //   urlError
          //     ? 'w-full min-w-0 flex-1 rounded border rounded-r-none border-red-500 px-2 py-1 outline-none focus:ring-2 focus:ring-red-400'
          //     : 'w-full min-w-0 flex-1 rounded border rounded-r-none border-gray-300 px-2 py-1 outline-none focus:ring-2 focus:ring-blue-400'
          // }
        />
        <button type="button" onClick={addBookmarkItem} className="bg-blue-500 p-2 text-white rounded-l-none">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {/* {urlError ? (
        <p className="text-sm text-red-600" role="alert">
          {urlError}
        </p>
      ) : null} */}
    </div>
  );
};

export const Header = ({
  searchText = '',
  onSearchTextChange,
  onClearSearch,
}) => {
  const hasSearchText = searchText.trim() !== '';

  return (
    <header className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3">
      <div className="flex min-w-0 flex-row items-center gap-2">
        <form className="flex min-w-0 flex-1 items-center gap-2" onSubmit={(event) => event.preventDefault()}>
          <InputWithIcon
            icon={<Search className="w-4 h-4" />}
            placeholder="Search bookmarks"
            value={searchText}
            onChange={(event) => onSearchTextChange?.(event.target.value)}
            ariaLabel="Search bookmarks by title or URL"
          />
          {hasSearchText ? (
            <button
              type="button"
              className="rounded-sm bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
              aria-label="Clear search"
              onClick={onClearSearch}
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </form>
      </div>
      <div className="flex flex-row items-center gap-2">
        <AddBookmarkForm />
        <UserMenu />
      </div>
    </header>
  );
};