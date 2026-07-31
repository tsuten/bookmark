import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Dialog } from "radix-ui";
import { fetchAllBookmarks } from "~/lib/api/bookmarks";
import { getAuthToken } from "~/lib/api/loaders";
import type { BookmarkItem } from "~/lib/api/types";
import { useAuth } from "~/lib/auth/auth-context";

function matchesBookmark(bookmark: BookmarkItem, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return false;
  }

  const haystack = [
    bookmark.title,
    bookmark.url,
    bookmark.note ?? "",
    ...(bookmark.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalizedQuery);
}

export function SearchCommandDialog() {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const filteredBookmarks = useMemo(
    () => bookmarks.filter((bookmark) => matchesBookmark(bookmark, query)),
    [bookmarks, query],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open || !user) {
      return;
    }

    let cancelled = false;

    async function loadBookmarks() {
      setLoading(true);
      setLoadError("");

      try {
        const token = await getAuthToken();
        const items = await fetchAllBookmarks(token, "active");
        if (!cancelled) {
          setBookmarks(items);
        }
      } catch (error) {
        if (!cancelled) {
          setBookmarks([]);
          setLoadError(
            error instanceof Error
              ? error.message
              : "Failed to load bookmarks.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadBookmarks();

    return () => {
      cancelled = true;
    };
  }, [open, user]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [open]);

  const resetState = () => {
    setQuery("");
    setLoadError("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetState();
    }
  };

  const handleSelect = (bookmark: BookmarkItem) => {
    window.open(bookmark.url, "_blank", "noopener,noreferrer");
    setOpen(false);
    resetState();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-w-0 flex-1">
      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger className="search-command-trigger">
        <Search aria-hidden className="size-4 shrink-0 text-gray-500" />
        <span className="min-w-0 flex-1 truncate text-left text-gray-400">
          Search bookmarks...
        </span>
        <kbd className="search-command-shortcut">
          {typeof navigator !== "undefined" &&
          /Mac|iPhone|iPod|iPad/.test(navigator.platform)
            ? "⌘ K"
            : "Ctrl K"}
        </kbd>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="command-dialog-overlay" />
        <Dialog.Content
          className="command-dialog-content"
          onOpenAutoFocus={(event: Event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <Dialog.Title className="sr-only">Search bookmarks</Dialog.Title>
          <Dialog.Description className="sr-only">
            Search bookmarks by title, URL, tags, or note.
          </Dialog.Description>
          <div className="command-dialog-input-row">
            <Search aria-hidden className="size-4 shrink-0 text-gray-500" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search bookmarks..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="command-dialog-input"
            />
          </div>
          <div className="command-dialog-results">
            {loading ? (
              <div className="command-dialog-empty flex justify-center">
                <Loader2 aria-hidden className="h-5 w-5 animate-spin text-gray-500" />
              </div>
            ) : loadError ? (
              <p className="command-dialog-empty text-red-600">{loadError}</p>
            ) : query.trim() === "" ? (
              <p className="command-dialog-empty">
                Type to search by title, URL, tags, or note.
              </p>
            ) : filteredBookmarks.length === 0 ? (
              <p className="command-dialog-empty">No bookmarks found.</p>
            ) : (
              <ul className="command-dialog-result-list">
                {filteredBookmarks.map((bookmark) => (
                  <li key={bookmark.id}>
                    <button
                      type="button"
                      className="command-dialog-result-item"
                      onClick={() => handleSelect(bookmark)}
                    >
                      <span className="truncate font-medium text-gray-900">
                        {bookmark.title}
                      </span>
                      <span className="truncate text-sm text-gray-500">
                        {bookmark.url}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
