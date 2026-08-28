import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Group, Panel, Separator, useGroupRef } from "react-resizable-panels";
import { BookmarkEditDrawer } from "~/components/bookmarks/BookmarkEditDrawer";
import { BookmarkListItems } from "~/components/bookmarks/BookmarkListItems";
import { BookmarkListToolbar } from "~/components/bookmarks/BookmarkListToolbar";
import {
  compareForMode,
  DEFAULT_GRID_COLUMN_MODE,
  GRID_COLUMN_OPTIONS,
  type GridColumnMode,
  type SortMode,
  VIEW_OPTIONS,
  type ViewMode,
} from "~/components/bookmarks/bookmarkListConstants";
import { bookmarkMatchesQuery } from "~/components/bookmarks/formatBookmarkDisplay";
import type { BookmarkItem } from "~/lib/types";

const STORAGE_KEY = "bookmarkEditPanelWidth";
const VIEW_MODE_STORAGE_KEY = "bookmarkListViewMode";
const GRID_COLUMNS_STORAGE_KEY = "bookmarkGridColumns";
const PANEL_LIST = "list";
const PANEL_EDIT = "edit";
const PANEL_ANIMATION_MS = 320;
const DEFAULT_EDIT_LAYOUT = { [PANEL_LIST]: 70, [PANEL_EDIT]: 30 };
const CLOSED_LAYOUT = { [PANEL_LIST]: 100, [PANEL_EDIT]: 0 };

function readSavedViewMode(): ViewMode {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return "list";
    }
    const raw = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (raw == null || raw === "") {
      return "list";
    }
    const isValid = VIEW_OPTIONS.some((option) => option.value === raw);
    return isValid ? (raw as ViewMode) : "list";
  } catch {
    return "list";
  }
}

function saveViewMode(viewMode: ViewMode) {
  try {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
  } catch {
    // private mode, quota, etc.
  }
}

function readSavedGridColumns(): GridColumnMode {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return DEFAULT_GRID_COLUMN_MODE;
    }
    const raw = localStorage.getItem(GRID_COLUMNS_STORAGE_KEY);
    if (raw == null || raw === "") {
      return DEFAULT_GRID_COLUMN_MODE;
    }
    const isValid = GRID_COLUMN_OPTIONS.some((option) => option.value === raw);
    return isValid ? (raw as GridColumnMode) : DEFAULT_GRID_COLUMN_MODE;
  } catch {
    return DEFAULT_GRID_COLUMN_MODE;
  }
}

function saveGridColumns(gridColumns: GridColumnMode) {
  try {
    localStorage.setItem(GRID_COLUMNS_STORAGE_KEY, gridColumns);
  } catch {
    // private mode, quota, etc.
  }
}

function readSavedLayout() {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return undefined;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw == null || raw === "") {
      return undefined;
    }
    const editSize = parseFloat(raw);
    if (!Number.isFinite(editSize) || editSize <= 0 || editSize >= 100) {
      return undefined;
    }
    return {
      [PANEL_LIST]: 100 - editSize,
      [PANEL_EDIT]: editSize,
    };
  } catch {
    return undefined;
  }
}

function scheduleLayout(
  groupRef: ReturnType<typeof useGroupRef>,
  layout: Record<string, number>,
) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      groupRef.current?.setLayout(layout);
    });
  });
}

type BookmarkListProps = {
  title: string;
  bookmarkItems?: BookmarkItem[];
};

export function BookmarkList({
  title,
  bookmarkItems = [],
}: BookmarkListProps) {
  const [sortBy, setSortBy] = useState<SortMode>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>(readSavedViewMode);
  const [gridColumns, setGridColumns] = useState<GridColumnMode>(
    readSavedGridColumns,
  );
  const [activeBookmark, setActiveBookmark] = useState<BookmarkItem | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [isPanelAnimating, setIsPanelAnimating] = useState(false);
  const groupRef = useGroupRef();
  const closeTimerRef = useRef<number | null>(null);
  const sortedBookmarkItems = useMemo(
    () =>
      bookmarkItems
        .filter((item) => bookmarkMatchesQuery(item, searchQuery))
        .sort(compareForMode(sortBy)),
    [bookmarkItems, searchQuery, sortBy],
  );

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsEditPanelOpen(false);
    setIsPanelAnimating(false);
    setActiveBookmark(null);
  }, [title]);

  const handleOpenEdit = useCallback(
    (bookmark: BookmarkItem) => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }

      setActiveBookmark(bookmark);
      setIsEditPanelOpen(true);
      setIsPanelAnimating(true);
      scheduleLayout(groupRef, readSavedLayout() ?? DEFAULT_EDIT_LAYOUT);

      window.setTimeout(() => setIsPanelAnimating(false), PANEL_ANIMATION_MS);
    },
    [groupRef],
  );

  const handleCloseEdit = useCallback(() => {
    if (!isEditPanelOpen) {
      setActiveBookmark(null);
      return;
    }

    setIsEditPanelOpen(false);
    setIsPanelAnimating(true);
    scheduleLayout(groupRef, CLOSED_LAYOUT);

    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = window.setTimeout(() => {
      setActiveBookmark(null);
      setIsPanelAnimating(false);
      closeTimerRef.current = null;
    }, PANEL_ANIMATION_MS);
  }, [groupRef, isEditPanelOpen]);

  const handleViewChange = useCallback((nextViewMode: ViewMode) => {
    setViewMode(nextViewMode);
    saveViewMode(nextViewMode);
  }, []);

  const handleGridColumnsChange = useCallback((nextGridColumns: GridColumnMode) => {
    setGridColumns(nextGridColumns);
    saveGridColumns(nextGridColumns);
  }, []);

  const bookmarkActions = useMemo(
    () => ({
      onEdit: handleOpenEdit,
      onArchive: () => undefined,
      onRestore: () => undefined,
      onUpdateTitle: () => undefined,
      updatingTitleId: null,
    }),
    [handleOpenEdit],
  );

  const isEditPanelVisible = isEditPanelOpen || isPanelAnimating;

  return (
    <Group
      id="bookmark-list-group"
      groupRef={groupRef}
      className={`bookmark-list-group h-full min-h-0${isPanelAnimating ? " is-animating" : ""}`}
      orientation="horizontal"
      onLayoutChanged={(layout) => {
        if (!isEditPanelOpen) {
          return;
        }
        const editWidth = layout[PANEL_EDIT];
        if (
          typeof editWidth !== "number" ||
          !Number.isFinite(editWidth) ||
          editWidth <= 0
        ) {
          return;
        }
        try {
          localStorage.setItem(STORAGE_KEY, String(editWidth));
        } catch {
          // private mode, quota, etc.
        }
      }}
    >
      <Panel id={PANEL_LIST} minSize={30}>
        <div className="flex h-full min-h-0 flex-col">
          <BookmarkListToolbar
            title={title}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            sortBy={sortBy}
            viewMode={viewMode}
            gridColumns={gridColumns}
            onSortChange={setSortBy}
            onViewChange={handleViewChange}
            onGridColumnsChange={handleGridColumnsChange}
          />
          <div className="relative flex min-h-0 flex-1 flex-col">
            <BookmarkListItems
              items={sortedBookmarkItems}
              viewMode={viewMode}
              gridColumns={gridColumns}
              actions={bookmarkActions}
            />
          </div>
        </div>
      </Panel>

      {isEditPanelVisible ? (
        <>
          <Separator
            id="bookmark-edit-separator"
            className="bookmark-edit-separator"
          />
          <Panel
            id={PANEL_EDIT}
            className="bookmark-edit-panel-container"
            minSize={isEditPanelOpen ? 240 : 0}
            maxSize={480}
          >
            {activeBookmark ? (
              <BookmarkEditDrawer
                bookmarkItem={activeBookmark}
                onClose={handleCloseEdit}
              />
            ) : null}
          </Panel>
        </>
      ) : null}
    </Group>
  );
}
