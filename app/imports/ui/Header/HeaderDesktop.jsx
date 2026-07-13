import React from 'react';
import { Search } from 'lucide-react';
import { InputWithIcon } from '../molecules/InputWithIcon';
import { UserMenu } from '../UserMenu.jsx';
import { AddBookmarkForm } from './AddBookmarkForm.jsx';

export const HeaderDesktop = () => (
  <header className="header-desktop">
    <form className="min-w-0 flex-1">
      <InputWithIcon icon={<Search className="size-4" />} placeholder="search" />
    </form>
    <div className="flex shrink-0 flex-row items-center gap-2">
      <AddBookmarkForm className="w-64" />
      <UserMenu />
    </div>
  </header>
);
