import { Fragment } from "react";
import { BookmarkListItemRow } from "~/components/bookmarks/items/BookmarkListItemRow";
import type { BookmarkListViewProps } from "~/components/bookmarks/views/types";

export function BookmarkListView({
  items,
  isLoading = false,
  actions,
}: BookmarkListViewProps) {
  return (
    <ul
      className={`min-h-0 flex-1 overflow-y-auto${isLoading ? " opacity-60" : ""}`}
    >
      {items.map((bookmarkItem) => (
        <Fragment key={bookmarkItem.id}>
          <BookmarkListItemRow bookmarkItem={bookmarkItem} actions={actions} />
          <hr />
        </Fragment>
      ))}
      {isLoading && items.length > 0 ? (
        <li className="p-3 text-center text-sm text-gray-500">Updating...</li>
      ) : null}
    </ul>
  );
}
