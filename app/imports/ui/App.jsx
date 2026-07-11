import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { useSubscribe, useTracker } from 'meteor/react-meteor-data';
import { Group, Panel } from 'react-resizable-panels';
import { Sidebar } from './Sidebar.jsx';
import { Header } from './Header.jsx';
import {
  AllBookmarksPage,
  ArchivedBookmarksPage,
  TaggedBookmarksPage,
  UncategorizedBookmarksPage,
} from './BookmarkListPage.jsx';
import { LoginPage } from './auth/LoginPage.jsx';
import { RegisterPage } from './auth/RegisterPage.jsx';

const STORAGE_KEY = 'sidebarWidth';
const PANEL_SIDEBAR = 'sidebar';
const PANEL_MAIN = 'main';

function readDefaultLayout() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return undefined;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw == null || raw === '') {
      return undefined;
    }
    const p = parseFloat(raw);
    if (!Number.isFinite(p) || p <= 0 || p >= 100) {
      return undefined;
    }
    return {
      [PANEL_SIDEBAR]: p,
      [PANEL_MAIN]: 100 - p,
    };
  } catch {
    return undefined;
  }
}

const RequireAuth = ({ children }) => {
  const { userId, loggingIn } = useTracker(() => ({
    userId: Meteor.userId(),
    loggingIn: Meteor.loggingIn(),
  }));

  if (loggingIn) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }
  if (!userId) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppLayout = () => {
  const defaultLayout = useMemo(() => readDefaultLayout(), []);
  const isBookmarksLoading = useSubscribe('bookmarkItems');
  const [hasLoadedBookmarks, setHasLoadedBookmarks] = useState(false);
  const [searchText, setSearchText] = useState('');
  const bookmarksLoading = isBookmarksLoading();
  const handleClearSearch = useCallback(() => setSearchText(''), []);

  useEffect(() => {
    if (!bookmarksLoading) {
      setHasLoadedBookmarks(true);
    }
  }, [bookmarksLoading]);

  return (
    <div className="app">
      <Group
        className="h-full"
        orientation="horizontal"
        defaultLayout={defaultLayout}
        onLayoutChanged={(layout) => {
          const w = layout[PANEL_SIDEBAR];
          if (typeof w !== 'number' || !Number.isFinite(w)) {
            return;
          }
          try {
            localStorage.setItem(STORAGE_KEY, String(w));
          } catch {
            // private mode, quota, etc.
          }
        }}
      >
        <Panel id={PANEL_SIDEBAR} minSize={100} defaultSize={200} maxSize={300}>
          <Sidebar />
        </Panel>
        <Panel id={PANEL_MAIN}>
          <main>
            <Header
              searchText={searchText}
              onSearchTextChange={setSearchText}
              onClearSearch={handleClearSearch}
            />
            <Outlet
              context={{
                isBookmarksLoading: !hasLoadedBookmarks,
                searchText,
              }}
            />
          </main>
        </Panel>
        <button data-tally-open="Y5vDN0" className="bg-blue-500 text-white px-4 py-2 rounded-full fixed bottom-4 right-4">Found a bug?</button>
      </Group>
    </div>
  );
};

export const App = () => (
  <Routes>
    <Route path="login" element={<LoginPage />} />
    <Route path="register" element={<RegisterPage />} />
    <Route
      path="/"
      element={(
        <RequireAuth>
          <AppLayout />
        </RequireAuth>
      )}
    >
      <Route index element={<AllBookmarksPage />} />
      <Route path="archived" element={<ArchivedBookmarksPage />} />
      <Route path="uncategorized" element={<UncategorizedBookmarksPage />} />
      <Route path=":tag" element={<TaggedBookmarksPage />} />
    </Route>
  </Routes>
);
