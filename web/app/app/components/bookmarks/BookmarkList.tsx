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
  type SortMode,
} from "~/components/bookmarks/bookmarkListConstants";
import type { BookmarkItem } from "~/lib/api/types";
import { archiveBookmark } from "~/lib/api/bookmarks";
import { getAuthToken } from "~/lib/api/loaders";

const STORAGE_KEY = "bookmarkEditPanelWidth";
const PANEL_LIST = "list";
const PANEL_EDIT = "edit";
const PANEL_ANIMATION_MS = 320;
const DEFAULT_EDIT_LAYOUT = { [PANEL_LIST]: 70, [PANEL_EDIT]: 30 };
const CLOSED_LAYOUT = { [PANEL_LIST]: 100, [PANEL_EDIT]: 0 };

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
            onSortChange={setSortBy}
          />
          <BookmarkListItems
            items={sortedBookmarkItems}
            isLoading={isLoading}
            error={error}
            onEdit={handleOpenEdit}
            onArchive={handleArchive}
          />
          <button
            type="button"
            data-tally-open="Y5vDN0"
            className="absolute bottom-4 right-4 z-10 rounded-full bg-blue-500 px-4 py-2 text-white"
          >
            Found a bug?
          </button>
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
