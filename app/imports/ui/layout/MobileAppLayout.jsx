import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../Sidebar.jsx';
import { Header } from '../Header/Header.jsx';
import { SidebarDrawer } from './SidebarDrawer.jsx';
import { BugReportButton } from './BugReportButton.jsx';

export const MobileAppLayout = ({ isBookmarksLoading }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="app">
      <SidebarDrawer open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
        <Sidebar />
      </SidebarDrawer>
      <main className="mobile-main">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <Outlet context={{ isBookmarksLoading }} />
      </main>
      <BugReportButton />
    </div>
  );
};
