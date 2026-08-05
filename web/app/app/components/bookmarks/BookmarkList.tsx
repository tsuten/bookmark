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
import type { BookmarkItem } from "~/lib/api/types";
import {
  archiveBookmark,
  restoreBookmark,
  updateBookmarkTitle,
} from "~/lib/api/bookmarks";
import { fetchPageTitle } from "~/lib/api/getTitle";
import { getAuthToken } from "~/lib/api/loaders";
import { ApiError } from "~/lib/api/client";
import { BugIcon, MessageCircle } from "lucide-react";

const STORAGE_KEY = "bookmarkEditPanelWidth";
const VIEW_MODE_STORAGE_KEY = "bookmarkListViewMode";
const GRID_COLUMNS_STORAGE_KEY = "bookmarkGridColumns";
const PANEL_LIST = "list";
const PANEL_EDIT = "edit";
const PANEL_ANIMATION_MS = 320;
const DEFAULT_EDIT_LAYOUT = { [PANEL_LIST]: 70, [PANEL_EDIT]: 30 };
const CLOSED_LAYOUT = { [PANEL_LIST]: 100, [PANEL_EDIT]: 0 };
const FEEDBACK_ROTATE_MS = 10_000;

const FEEDBACK_VARIANTS = [
  { icon: BugIcon, label: "Found a bug?" },
  { icon: MessageCircle, label: "Help us improve" },
] as const;

function FeedbackRotateButton() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % FEEDBACK_VARIANTS.length);
    }, FEEDBACK_ROTATE_MS);

    return () => window.clearInterval(timer);
  }, []);

  const { icon: Icon, label } = FEEDBACK_VARIANTS[activeIndex];

  return (
    <button
      type="button"
      data-tally-open="Y5vDN0"
      className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-white"
    >
      <span
        key={activeIndex}
        className="feedback-rotate-content flex items-center gap-2"
      >
        <Icon aria-hidden className="size-4" />
        {label}
      </span>
    </button>
  );
}

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
  isLoading?: boolean;
  error?: string | null;
  onMutate: () => void;
};

export function BookmarkList({
  title,
  bookmarkItems = [],
  isLoading = false,
  error = null,
  onMutate,
}: BookmarkListProps) {
  const [sortBy, setSortBy] = useState<SortMode>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>(readSavedViewMode);
  const [gridColumns, setGridColumns] = useState<GridColumnMode>(
    readSavedGridColumns,
  );
  const [updatingTitleId, setUpdatingTitleId] = useState<string | null>(null);
  const [activeBookmark, setActiveBookmark] = useState<BookmarkItem | null>(
    null,
  );
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [isPanelAnimating, setIsPanelAnimating] = useState(false);
  const groupRef = useGroupRef();
  const closeTimerRef = useRef<number | null>(null);
  const sortedBookmarkItems = useMemo(
    () => [...bookmarkItems].sort(compareForMode(sortBy)),
    [bookmarkItems, sortBy],
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

  const handleArchive = async (bookmark: BookmarkItem) => {
    try {
      const token = await getAuthToken();
      await archiveBookmark(token, bookmark.id);
      onMutate();
    } catch (archiveError) {
      console.error("[bookmark] archive failed:", archiveError);
    }
  };

  const handleRestore = async (bookmark: BookmarkItem) => {
    try {
      const token = await getAuthToken();
      await restoreBookmark(token, bookmark.id);
      onMutate();
    } catch (restoreError) {
      console.error("[bookmark] restore failed:", restoreError);
    }
  };

  const handleUpdateTitle = async (bookmark: BookmarkItem) => {
    setUpdatingTitleId(bookmark.id);
    try {
      const token = await getAuthToken();
      const title = await fetchPageTitle(token, bookmark.url);
      if (!title) {
        console.error("[bookmark] title not found:", bookmark.url);
        return;
      }
      await updateBookmarkTitle(token, bookmark.id, title);
      onMutate();
    } catch (error) {
      console.error(
        "[bookmark] update title failed:",
        error instanceof ApiError ? error.message : error,
      );
    } finally {
      setUpdatingTitleId(null);
    }
  };

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
      onArchive: handleArchive,
      onRestore: handleRestore,
      onUpdateTitle: handleUpdateTitle,
      updatingTitleId,
    }),
    [handleOpenEdit, updatingTitleId],
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
        <div className="relative flex h-full min-h-0 flex-col">
          <BookmarkListToolbar
            title={title}
            sortBy={sortBy}
            viewMode={viewMode}
            gridColumns={gridColumns}
            onSortChange={setSortBy}
            onViewChange={handleViewChange}
            onGridColumnsChange={handleGridColumnsChange}
          />
          <BookmarkListItems
            items={sortedBookmarkItems}
            viewMode={viewMode}
            gridColumns={gridColumns}
            isLoading={isLoading}
            error={error}
            actions={bookmarkActions}
          />
          <FeedbackRotateButton />
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
                onSaved={onMutate}
              />
            ) : null}
          </Panel>
        </>
      ) : null}
    </Group>
  );
}
