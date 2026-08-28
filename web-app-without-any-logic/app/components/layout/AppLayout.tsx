import { useMemo } from "react";
import { Outlet } from "react-router";
import { Group, Panel } from "react-resizable-panels";
import { Sidebar } from "~/components/layout/Sidebar";

const STORAGE_KEY = "sidebarWidth";
const PANEL_SIDEBAR = "sidebar";
const PANEL_MAIN = "main";

// Percent layout matching ~200px sidebar. Used when localStorage is empty
// (SSR, first visit) so panels do not split 50/50.
const FALLBACK_LAYOUT = {
  [PANEL_SIDEBAR]: 16,
  [PANEL_MAIN]: 84,
};

function readDefaultLayout() {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return FALLBACK_LAYOUT;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw == null || raw === "") {
      return FALLBACK_LAYOUT;
    }
    const p = parseFloat(raw);
    if (!Number.isFinite(p) || p < 8 || p > 40) {
      return FALLBACK_LAYOUT;
    }
    return {
      [PANEL_SIDEBAR]: p,
      [PANEL_MAIN]: 100 - p,
    };
  } catch {
    return FALLBACK_LAYOUT;
  }
}

export function AppLayout() {
  const defaultLayout = useMemo(() => readDefaultLayout(), []);

  return (
    <div className="app">
      <Group
        className="h-full"
        orientation="horizontal"
        defaultLayout={defaultLayout}
        onLayoutChanged={(layout) => {
          const w = layout[PANEL_SIDEBAR];
          if (typeof w !== "number" || !Number.isFinite(w)) {
            return;
          }
          try {
            localStorage.setItem(STORAGE_KEY, String(w));
          } catch {
            // private mode, quota, etc.
          }
        }}
      >
        <Panel
          id={PANEL_SIDEBAR}
          minSize={150}
          defaultSize={200}
          maxSize={300}
        >
          <Sidebar />
        </Panel>
        <Panel id={PANEL_MAIN}>
          <main>
            {/* <Header /> */}
            <Outlet />
          </main>
        </Panel>
      </Group>
    </div>
  );
}
