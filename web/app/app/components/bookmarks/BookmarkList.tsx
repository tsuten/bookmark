import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Group, Panel, Separator, useGroupRef } from "react-resizable-panels";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Bookmark,
  ClockArrowDown,
  ClockArrowUp,
} from "lucide-react";
import { BookmarkItemRow } from "~/components/bookmarks/BookmarkItem";
import { BookmarkEditDrawer } from "~/components/bookmarks/BookmarkEditDrawer";
import { Dropdown } from "~/components/molecules/Dropdown";
import type { BookmarkItem } from "~/lib/api/types";
import { archiveBookmark } from "~/lib/api/bookmarks";
import { getAuthToken } from "~/lib/api/loaders";

const STORAGE_KEY = "bookmarkEditPanelWidth";
const PANEL_LIST = "list";
const PANEL_EDIT = "edit";
const PANEL_ANIMATION_MS = 320;
const DEFAULT_EDIT_LAYOUT = { [PANEL_LIST]: 70, [PANEL_EDIT]: 30 };
const CLOSED_LAYOUT = { [PANEL_LIST]: 100, [PANEL_EDIT]: 0 };

const SORT_OPTIONS = [
  { value: "newest", label: "Newest", Icon: ClockArrowDown },
  { value: "oldest", label: "Oldest", Icon: ClockArrowUp },
  { value: "az", label: "A-Z", Icon: ArrowUpAZ },
  { value: "za", label: "Z-A", Icon: ArrowDownAZ },
] as const;

type SortMode = (typeof SORT_OPTIONS)[number]["value"];

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

function compareNullableStrings(a: string | undefined, b: string | undefined) {
  return (a || "").localeCompare(b || "");
}

function compareDates(a: string, b: string) {
  return new Date(a || 0).getTime() - new Date(b || 0).getTime();
}

function compareForMode(mode: SortMode) {
  switch (mode) {
    case "newest":
      return (a: BookmarkItem, b: BookmarkItem) =>
        compareDates(b.createdAt, a.createdAt);
    case "oldest":
      return (a: BookmarkItem, b: BookmarkItem) =>
        compareDates(a.createdAt, b.createdAt);
    case "az":
      return (a: BookmarkItem, b: BookmarkItem) =>
        compareNullableStrings(a.title, b.title);
    case "za":
      return (a: BookmarkItem, b: BookmarkItem) =>
        compareNullableStrings(b.title, a.title);
    default:
      return (a: BookmarkItem, b: BookmarkItem) =>
        compareDates(b.createdAt, a.createdAt);
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
      await archiveBookmark(token, bookmark._id);
      onMutate();
    } catch (error) {
      console.error("[bookmark] archive failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <Group
      id="bookmark-list-group"
      groupRef={groupRef}
      className={`bookmark-list-group h-full min-h-0${isPanelAnimating ? " is-animating" : ""}`}
      orientation="horizontal"
      defaultLayout={CLOSED_LAYOUT}
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
          <div className="shrink-0">
            <div className="flex flex-row items-center justify-between gap-2">
              <div className="m-2 flex flex-row items-center gap-2">
                <Bookmark className="h-4 w-4" />
                <h2>{title}</h2>
              </div>
              <div className="flex flex-row items-center gap-2">
                <Dropdown
                  options={[...SORT_OPTIONS]}
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as SortMode)}
                />
              </div>
            </div>
            <hr />
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto">
            {sortedBookmarkItems.map((bookmarkItem) => (
              <Fragment key={bookmarkItem._id}>
                <BookmarkItemRow
                  bookmarkItem={bookmarkItem}
                  onEdit={handleOpenEdit}
                  onArchive={handleArchive}
                />
                <hr />
              </Fragment>
            ))}
          </ul>
        </div>
      </Panel>

      {isEditPanelOpen ? (
        <Separator
          id="bookmark-edit-separator"
          className="bookmark-edit-separator"
        />
      ) : null}

      <Panel
        id={PANEL_EDIT}
        className="bookmark-edit-panel-container"
        collapsible
        collapsedSize={0}
        defaultSize={0}
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
    </Group>
  );
}
