import React, { useState } from 'react';

export const Header = () => {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');

    const handleTitleChange = (event) => {
        setTitle(event.target.value);
    }

    const handleUrlChange = (event) => {
        setUrl(event.target.value);
    }

    const addBookmarkItem = () => {
        Meteor.call('addBookmarkItem', title, url);
        setTitle('');
        setUrl('');
    }

  return (
    <header>
      <h1>Header</h1>

      <div>
        <input type="text" placeholder="add title" value={title} onChange={handleTitleChange} />
        <input type="text" placeholder="add url" value={url} onChange={handleUrlChange} />
        <button onClick={addBookmarkItem}>Add Bookmark</button>
      </div>
    </header>
  );
};