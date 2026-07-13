import React from 'react';
import { Menu, Search } from 'lucide-react';
import { InputWithIcon } from '../molecules/InputWithIcon';
import { UserMenu } from '../UserMenu.jsx';
import { AddBookmarkForm } from './AddBookmarkForm.jsx';

export const HeaderMobile = ({ onMenuClick }) => (
  <header className="header-mobile">
    <div className="header-mobile-toolbar">
      <button
        type="button"
        className="rounded-sm p-2 text-gray-700 hover:bg-gray-200"
        aria-label="Open navigation menu"
        onClick={onMenuClick}
      >
        <Menu className="size-5" aria-hidden />
      </button>
      <UserMenu />
    </div>
    <form className="w-full min-w-0">
      <InputWithIcon icon={<Search className="size-4" />} placeholder="search" />
    </form>
    <AddBookmarkForm className="w-full" />
  </header>
);
