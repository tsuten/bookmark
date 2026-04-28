import React, { useMemo } from 'react';
import { useFind, useSubscribe } from 'meteor/react-meteor-data';
import { BookmarkItemsCollection } from '../api/bookmarkItems';
import { Link, useParams, useLocation } from 'react-router-dom';
import { Tag, Bookmark, Search, Archive, List } from 'lucide-react';
import { InputWithIcon } from './molecules/InputWithIcon';

const uniqueTagsFromItems = (items) => {
  const set = new Set();
  for (const item of items) {
    for (const t of item.tags || []) {
      set.add(t);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b));
};

const SidebarItem = ({ to, placeholder, icon, isActive }) => {
  return (
    <Link to={to} className="block min-w-0">
      <li
        className={`flex min-w-0 flex-row gap-2 items-center p-1 pl-3 hover:bg-gray-200 ${isActive ? 'bg-gray-200' : ''}`}
      >
        <span className="inline-flex shrink-0 items-center justify-center [&_svg]:size-4 [&_svg]:shrink-0">
          {icon}
        </span>
        <span className="min-w-0 flex-1 truncate">{placeholder}</span>
      </li>
    </Link>
  );
};

export const Sidebar = () => {
  const { tag: routeTag } = useParams();
  const { pathname } = useLocation();
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
    <div className="sidebar min-w-0 overflow-x-hidden">
      <ul className="min-w-0">
        <SidebarItem
          to="/"
          placeholder="All Bookmarks"
          icon={<Bookmark className="w-4 h-4" />}
          isActive={pathname === '/'}
        />
        <SidebarItem
          to="/uncategorized"
          placeholder="Uncategorized"
          icon={<List className="w-4 h-4" />}
          isActive={routeTag === 'uncategorized'}
        />
        <SidebarItem
          to="/archived"
          placeholder="Archived"
          icon={<Archive className="w-4 h-4" />}
          isActive={routeTag === 'archived'}
        />
        <hr />
        <div className="flex w-full min-w-0 flex-row gap-2 items-center">
          <InputWithIcon icon={<Search className="w-4 h-4" />} placeholder="search tags"/>
        </div>
        {bookmarkTags.map((tag) => (
          <SidebarItem
            key={tag}
            to={`/${encodeURIComponent(tag)}`}
            placeholder={tag}
            icon={<Tag className="w-4 h-4" />}
            isActive={routeTag === tag}
          />
        ))}
      </ul>
    </div>
  );
};
