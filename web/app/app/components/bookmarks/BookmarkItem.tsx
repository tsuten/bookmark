import { Archive, ArchiveRestore, Pencil } from "lucide-react";
import type { BookmarkItem } from "~/lib/api/types";

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
};

export function BookmarkItemRow({
  bookmarkItem,
  onEdit,
  onArchive,
  onRestore,
}: BookmarkItemRowProps) {
  const tagsLabel =
    (bookmarkItem.tags ?? []).join(", ") || "No tags";
  const urlDomain = formatUrlDomain(bookmarkItem.url);

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
