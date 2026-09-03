import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Meteor } from 'meteor/meteor';
import { TagsInput } from './molecules/TagsInput.jsx';
import {
  bookmarkUrlErrorMessage,
  validateHttpUrlString,
} from '../api/bookmarkItems';

export const BookmarkEditDrawer = ({ bookmarkItem, onClose }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState([]);
  const [note, setNote] = useState('');
  const [urlError, setUrlError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!bookmarkItem) return;
    setTitle(bookmarkItem.title || '');
    setUrl(bookmarkItem.url || '');
    setTags(bookmarkItem.tags || []);
    setNote(bookmarkItem.note || '');
    setUrlError('');
    setSubmitError('');
    setSubmitting(false);
  }, [bookmarkItem?._id]);

  const handleUrlChange = (event) => {
    setUrl(event.target.value);
    if (urlError) setUrlError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!bookmarkItem) return;

    const result = validateHttpUrlString(url);
    if (!result.valid) {
      setUrlError(bookmarkUrlErrorMessage(result.errorCode));
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    Meteor.call(
      'updateBookmarkItem',
      {
        _id: bookmarkItem._id,
        title,
        url: url.trim(),
        tags,
        note: note.trim(),
      },
      (error) => {
        setSubmitting(false);
        if (error) {
          setSubmitError(error.reason || 'Failed to save bookmark.');
          return;
        }
        onClose();
      }
    );
  };

  if (!bookmarkItem) return null;

  return (
    <div className="bookmark-edit-panel" aria-label="Edit bookmark">
      <div className="flex items-center justify-between border-b border-gray-300 p-4">
        <h2 className="text-lg font-semibold text-gray-900">Edit bookmark</h2>
        <button
          type="button"
          className="p-1 text-gray-500 hover:bg-gray-100"
          aria-label="Close"
          onClick={onClose}
        >
          <X className="w-4 h-4" aria-hidden />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col gap-4 overflow-y-auto p-4"
      >
        <label className="flex flex-col gap-1 text-sm text-gray-700">
          Title
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Bookmark title"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-gray-700">
          URL
          <input
            type="url"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://example.com"
            aria-invalid={urlError ? 'true' : 'false'}
          />
          {urlError ? (
            <p className="text-sm text-red-600" role="alert">
              {urlError}
            </p>
          ) : null}
        </label>

        <label className="flex flex-col gap-1 text-sm text-gray-700">
          Tags
          <TagsInput value={tags} onChange={setTags} />
        </label>

        <label className="flex flex-col gap-1 text-sm text-gray-700">
          Note
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Short description"
            rows={2}
            maxLength={500}
          />
        </label>

        {submitError ? (
          <p className="text-sm text-red-600" role="alert">
            {submitError}
          </p>
        ) : null}

        <div className="mt-auto flex justify-end gap-2 border-t border-gray-300 pt-4">
          <button
            type="button"
            className="bg-gray-100 px-3 py-2 text-sm"
            disabled={submitting}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 px-3 py-2 text-sm text-white disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};
