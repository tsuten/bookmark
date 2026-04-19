import React from 'react';
import { Hello } from './Hello.jsx';
import { Info } from './Info.jsx';
import {Sidebar} from './Sidebar.jsx';
import {BookmarkList} from './BookmarkList.jsx';
import {Header} from './Header.jsx';

export const App = () => (
  <div className="app">
    <Sidebar/>
    <main>
      <Header/>
      <BookmarkList/>
    </main>
  </div>
);
