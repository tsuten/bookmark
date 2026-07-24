import { useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Loader2,
  Pencil,
  RefreshCw,
} from "lucide-react";
import type { BookmarkItem } from "~/lib/api/types";
import { updateBookmarkTitle } from "~/lib/api/bookmarks";
import { fetchPageTitle } from "~/lib/api/getTitle";
import { getAuthToken } from "~/lib/api/loaders";
import { ApiError } from "~/lib/api/client";

function formatCreatedAtLabel(createdAt: string) {
  const d = new Date(createdAt);
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (isToday) {
    return d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return d.toLocaleDateString(undefined, { month: "numeric", day: "numeric" });
}

function formatUrlDomain(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

type BookmarkItemRowProps = {
  bookmarkItem: BookmarkItem;
  onEdit: (bookmark: BookmarkItem) => void;
  onArchive: (bookmark: BookmarkItem) => void;
  onRestore: (bookmark: BookmarkItem) => void;
  onMutate: () => void;
};

export function BookmarkItemRow({
  bookmarkItem,
  onEdit,
  onArchive,
  onRestore,
  onMutate,
}: BookmarkItemRowProps) {
  const [updatingTitle, setUpdatingTitle] = useState(false);
  const tagsLabel =
    (bookmarkItem.tags ?? []).join(", ") || "No tags";
  const urlDomain = formatUrlDomain(bookmarkItem.url);

  const handleUpdateTitle = async () => {
    setUpdatingTitle(true);
    try {
      const token = await getAuthToken();
      const title = await fetchPageTitle(token, bookmarkItem.url);
      if (!title) {
        console.error("[bookmark] title not found:", bookmarkItem.url);
        return;
      }
      await updateBookmarkTitle(token, bookmarkItem.id, title);
      onMutate();
    } catch (error) {
      console.error(
        "[bookmark] update title failed:",
        error instanceof ApiError ? error.message : error,
      );
    } finally {
      setUpdatingTitle(false);
    }
  };

  return (
    <li>
      <div className="group flex min-w-0 flex-row justify-between gap-2 hover:bg-gray-100">
        <a
          href={bookmarkItem.url}
          target="_blank"
          rel="noreferrer"
          className="min-w-0 flex-1 overflow-hidden"
        >
          <div className="flex min-w-0 flex-col p-3">
            <span className="truncate" title={bookmarkItem.title}>
              {bookmarkItem.title}
            </span>
            <div className="flex min-w-0 flex-row items-center gap-4">
              <span
                className="max-w-[40%] min-w-0 shrink truncate text-sm text-gray-500"
                title={tagsLabel}
              >
                {tagsLabel}
              </span>
              <span
                className="min-w-0 truncate text-sm text-gray-500"
                title={bookmarkItem.url}
              >
                {urlDomain}
              </span>
              <span className="shrink-0 whitespace-nowrap text-sm text-gray-500">
                {formatCreatedAtLabel(bookmarkItem.createdAt)}
              </span>
            </div>
            {bookmarkItem.note ? (
              <span
                className="line-clamp-1 text-sm text-gray-500"
                title={bookmarkItem.note}
              >
                {bookmarkItem.note}
              </span>
            ) : null}
          </div>
        </a>
        <div className="hidden shrink-0 items-center gap-2 group-hover:flex px-4">
          <button
            type="button"
            className="p-2 text-gray-600 hover:bg-gray-200"
            aria-label="タイトルを更新"
            disabled={updatingTitle}
            onClick={() => void handleUpdateTitle()}
          >
            {updatingTitle ? (
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw aria-hidden className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            className="p-2 text-gray-600 hover:bg-gray-200"
            aria-label="Edit"
            onClick={() => onEdit(bookmarkItem)}
          >
            <Pencil className="h-4 w-4" />
          </button>
          {bookmarkItem.is_archived ? (
            <button
              type="button"
              className="p-2 text-gray-600 hover:bg-gray-200"
              aria-label="Restore"
              onClick={() => onRestore(bookmarkItem)}
            >
              <ArchiveRestore className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              className="p-2 text-gray-600 hover:bg-gray-200"
              aria-label="Archive"
              onClick={() => onArchive(bookmarkItem)}
            >
              <Archive className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
