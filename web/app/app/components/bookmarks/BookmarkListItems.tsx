import { Fragment } from "react";
import { BookmarkItemRow } from "~/components/bookmarks/BookmarkItem";
import type { BookmarkItem } from "~/lib/api/types";

type BookmarkListItemsProps = {
  items: BookmarkItem[];
  isLoading?: boolean;
  error?: string | null;
  onEdit: (bookmark: BookmarkItem) => void;
  onArchive: (bookmark: BookmarkItem) => void;
  onRestore: (bookmark: BookmarkItem) => void;
};

export function BookmarkListItems({
  items,
  isLoading = false,
  error = null,
  onEdit,
  onArchive,
  onRestore,
}: BookmarkListItemsProps) {
  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 text-red-600">
        {error}
      </div>
    );
  }

  if (isLoading && items.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <ul
      className={`min-h-0 flex-1 overflow-y-auto${isLoading ? " opacity-60" : ""}`}
    >
      {items.map((bookmarkItem) => (
        <Fragment key={bookmarkItem.id}>
          <BookmarkItemRow
            bookmarkItem={bookmarkItem}
            onEdit={onEdit}
            onArchive={onArchive}
            onRestore={onRestore}
          />
          <hr />
        </Fragment>
      ))}
      {isLoading && items.length > 0 ? (
        <li className="p-3 text-center text-sm text-gray-500">Updating...</li>
      ) : null}
    </ul>
  );
}
