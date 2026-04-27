import React, { useMemo } from 'react';
import { useFind, useSubscribe } from 'meteor/react-meteor-data';
import { BookmarkItemsCollection } from '../api/bookmarkItems';
import { Link } from 'react-router-dom';
import { Tag, Bookmark, Search, Archive, List } from 'lucide-react';

const uniqueTagsFromItems = (items) => {
  const set = new Set();
  for (const item of items) {
    for (const t of item.tags || []) {
      set.add(t);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b));
};

const SidebarItem = ({ to, placeholder, icon }) => {
  return (
    <Link to={to}>
      <li className="flex flex-row gap-2 items-center p-1 pl-3 hover:bg-gray-200">
        {icon}
        {placeholder}
      </li>
    </Link>
  );
};

export const Sidebar = () => {
  const isLoading = useSubscribe('bookmarkTags');
  const itemsWithTags = useFind(() =>
    BookmarkItemsCollection.find({}, { fields: { tags: 1 } })
  );
  const bookmarkTags = useMemo(
    () => uniqueTagsFromItems(itemsWithTags),
    [itemsWithTags]
  );

  if (isLoading()) {
    return <div>Loading...</div>;
  }

  return (
    <div className="sidebar">
      <ul>
        <SidebarItem to="/" placeholder="All Bookmarks" icon={<Bookmark className="w-4 h-4" />} />
        <SidebarItem to="/uncategorized" placeholder="Uncategorized" icon={<List className="w-4 h-4" />} />
        <SidebarItem to="/archived" placeholder="Archived" icon={<Archive className="w-4 h-4" />} />
        <hr />
        <div className="flex flex-row gap-2 items-center">
          <h3 className="text-sm text-gray-500">Tags</h3>
          <Search className="w-4 h-4" />
          <input type="text" placeholder="search tags"/>
        </div>
        {bookmarkTags.map((tag) => (
          <SidebarItem to={`/${tag}`} placeholder={tag} icon={<Tag className="w-4 h-4" />} />
        ))}
      </ul>
    </div>
  );
};
