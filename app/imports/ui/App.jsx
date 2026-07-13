import React, { useEffect, useState } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { useSubscribe, useTracker } from 'meteor/react-meteor-data';
import { useIsMobile } from './responsive';
import { DesktopAppLayout } from './layout/DesktopAppLayout.jsx';
import { MobileAppLayout } from './layout/MobileAppLayout.jsx';
import {
  AllBookmarksPage,
  ArchivedBookmarksPage,
  TaggedBookmarksPage,
  UncategorizedBookmarksPage,
} from './BookmarkListPage.jsx';
import { LoginPage } from './auth/LoginPage.jsx';
import { RegisterPage } from './auth/RegisterPage.jsx';

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
  const isMobile = useIsMobile();
  const isBookmarksLoading = useSubscribe('bookmarkItems');
  const [hasLoadedBookmarks, setHasLoadedBookmarks] = useState(false);
  const bookmarksLoading = isBookmarksLoading();

  useEffect(() => {
    if (!bookmarksLoading) {
      setHasLoadedBookmarks(true);
    }
  }, [bookmarksLoading]);

  const layoutProps = { isBookmarksLoading: !hasLoadedBookmarks };

  if (isMobile) {
    return <MobileAppLayout {...layoutProps} />;
  }

  return <DesktopAppLayout {...layoutProps} />;
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
