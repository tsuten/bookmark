import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Group, Panel, Separator, useGroupRef } from 'react-resizable-panels';
import { BookmarkItem } from './BookmarkItem.jsx';
import { BookmarkEditDrawer } from './BookmarkEditDrawer.jsx';
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Bookmark,
  ClockArrowDown,
  ClockArrowUp,
} from 'lucide-react';
import { Dropdown } from './molecules/Dropdown.jsx';

const STORAGE_KEY = 'bookmarkEditPanelWidth';
const PANEL_LIST = 'list';
const PANEL_EDIT = 'edit';
const PANEL_ANIMATION_MS = 320;
const DEFAULT_EDIT_LAYOUT = { [PANEL_LIST]: 70, [PANEL_EDIT]: 30 };
const CLOSED_LAYOUT = { [PANEL_LIST]: 100, [PANEL_EDIT]: 0 };

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest', Icon: ClockArrowDown },
  { value: 'oldest', label: 'Oldest', Icon: ClockArrowUp },
  { value: 'az', label: 'A-Z', Icon: ArrowUpAZ },
  { value: 'za', label: 'Z-A', Icon: ArrowDownAZ },
];

function readSavedLayout() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return undefined;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw == null || raw === '') {
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

function compareNullableStrings(a, b) {
  return (a || '').localeCompare(b || '');
}

function compareDates(a, b) {
  return new Date(a || 0).getTime() - new Date(b || 0).getTime();
}

function compareForMode(mode) {
  switch (mode) {
    case 'newest':
      return (a, b) => compareDates(b.createdAt, a.createdAt);
    case 'oldest':
      return (a, b) => compareDates(a.createdAt, b.createdAt);
    case 'az':
      return (a, b) => compareNullableStrings(a.title, b.title);
    case 'za':
      return (a, b) => compareNullableStrings(b.title, a.title);
    default:
      return (a, b) => compareDates(b.createdAt, a.createdAt);
  }
}

function scheduleLayout(groupRef, layout) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      groupRef.current?.setLayout(layout);
    });
  });
}

export const BookmarkList = ({
  title,
  bookmarkItems = [],
  isLoading = false,
  searchText = '',
  totalBookmarkCount = bookmarkItems.length,
}) => {
  const [sortBy, setSortBy] = useState('newest');
  const [activeBookmark, setActiveBookmark] = useState(null);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [isPanelAnimating, setIsPanelAnimating] = useState(false);
  const groupRef = useGroupRef();
  const closeTimerRef = useRef(null);
  const sortedBookmarkItems = useMemo(
    () => [...bookmarkItems].sort(compareForMode(sortBy)),
    [bookmarkItems, sortBy]
  );

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const handleOpenEdit = useCallback((bookmark) => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setActiveBookmark(bookmark);
    setIsEditPanelOpen(true);
    setIsPanelAnimating(true);
    scheduleLayout(groupRef, readSavedLayout() ?? DEFAULT_EDIT_LAYOUT);

    window.setTimeout(() => setIsPanelAnimating(false), PANEL_ANIMATION_MS);
  }, [groupRef]);

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

  if (isLoading) {
    return <div className="flex h-full items-center justify-center text-gray-500">Loading...</div>;
  }

  return (
    <Group
      id="bookmark-list-group"
      groupRef={groupRef}
      className={`bookmark-list-group h-full min-h-0${isPanelAnimating ? ' is-animating' : ''}`}
      orientation="horizontal"
      defaultLayout={CLOSED_LAYOUT}
      onLayoutChanged={(layout) => {
        if (!isEditPanelOpen) return;
        const editWidth = layout[PANEL_EDIT];
        if (typeof editWidth !== 'number' || !Number.isFinite(editWidth) || editWidth <= 0) {
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
                <Bookmark className="w-4 h-4" />
                <h2>{title}</h2>
                {searchText.trim() ? (
                  <span className="text-sm text-gray-500">
                    {bookmarkItems.length} / {totalBookmarkCount}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-row items-center gap-2">
                <Dropdown
                  options={SORT_OPTIONS}
                  value={sortBy}
                  onValueChange={setSortBy}
                />
              </div>
            </div>
            <hr />
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto">
            {sortedBookmarkItems.map((bookmarkItem) => (
              <React.Fragment key={bookmarkItem._id}>
                <BookmarkItem
                  bookmarkItem={bookmarkItem}
                  onEdit={handleOpenEdit}
                />
                <hr />
              </React.Fragment>
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
          />
        ) : null}
      </Panel>
    </Group>
  );
};
