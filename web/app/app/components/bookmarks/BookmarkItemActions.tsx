import {
  Archive,
  ArchiveRestore,
  Loader2,
  Pencil,
  RefreshCw,
} from "lucide-react";
import type { BookmarkItem } from "~/lib/api/types";

export type BookmarkItemActionsProps = {
  bookmarkItem: BookmarkItem;
  onEdit: (bookmark: BookmarkItem) => void;
  onArchive: (bookmark: BookmarkItem) => void;
  onRestore: (bookmark: BookmarkItem) => void;
  onUpdateTitle: (bookmark: BookmarkItem) => void;
  updatingTitle?: boolean;
  className?: string;
};

export function BookmarkItemActions({
  bookmarkItem,
  onEdit,
  onArchive,
  onRestore,
  onUpdateTitle,
  updatingTitle = false,
  className = "hidden shrink-0 items-center gap-2 group-hover:flex px-4",
}: BookmarkItemActionsProps) {
  return (
    <div className={className}>
      <button
        type="button"
        className="p-2 text-gray-600 hover:bg-gray-200"
        aria-label="タイトルを更新"
        disabled={updatingTitle}
        onClick={() => onUpdateTitle(bookmarkItem)}
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
  );
}
