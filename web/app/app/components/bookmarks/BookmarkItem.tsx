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
  return (
    <li>
      <div className="group flex flex-row justify-between gap-2 hover:bg-gray-100">
        <a href={bookmarkItem.url} target="_blank" rel="noreferrer">
          <div className="flex flex-col p-3">
            {bookmarkItem.title}
            <div className="flex flex-row gap-4">
              <span className="text-sm text-gray-500">
                {(bookmarkItem.tags ?? []).join(", ") || "No tags"}
              </span>
              <span className="text-sm text-gray-500">{bookmarkItem.url}</span>
              <span className="text-sm text-gray-500">
                {formatCreatedAtLabel(bookmarkItem.createdAt)}
              </span>
            </div>
            {bookmarkItem.note ? (
              <span className="line-clamp-1 text-sm text-gray-500">
                {bookmarkItem.note}
              </span>
            ) : null}
          </div>
        </a>
        <div className="hidden shrink-0 items-center gap-2 group-hover:flex">
          <button
            type="button"
            className="rounded-sm p-2 text-blue-500 hover:bg-gray-200"
            onClick={() => onEdit(bookmarkItem)}
          >
            <Pencil className="h-4 w-4" />
          </button>
          {bookmarkItem.is_archived ? (
            <button
              type="button"
              className="rounded-sm p-2 text-gray-600 hover:bg-gray-200"
              aria-label="Restore"
              onClick={() => onRestore(bookmarkItem)}
            >
              <ArchiveRestore className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              className="rounded-sm p-2 text-gray-600 hover:bg-gray-200"
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
