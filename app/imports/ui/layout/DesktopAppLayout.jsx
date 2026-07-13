import React, { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { Group, Panel } from 'react-resizable-panels';
import { Sidebar } from '../Sidebar.jsx';
import { Header } from '../Header/Header.jsx';
import { BugReportButton } from './BugReportButton.jsx';

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

export const DesktopAppLayout = ({ isBookmarksLoading }) => {
  const defaultLayout = useMemo(() => readDefaultLayout(), []);

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
            <Header />
            <Outlet context={{ isBookmarksLoading }} />
          </main>
        </Panel>
      </Group>
      <BugReportButton />
    </div>
  );
};
