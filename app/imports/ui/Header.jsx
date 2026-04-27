import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { InputWithIcon } from './molecules/InputWithIcon';
import { Search } from 'lucide-react';

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
      <form>
        <InputWithIcon icon={<Search className="w-4 h-4" />} placeholder="search"/>
      </form>
      <div>
        <input type="text" placeholder="Enter URL" value={url} onChange={handleUrlChange} required />
        <button onClick={addBookmarkItem} className="bg-blue-500 text-white p-2">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};