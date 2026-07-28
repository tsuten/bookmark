import { BookmarkGridItemCard } from "~/components/bookmarks/items/BookmarkGridItemCard";
import type { BookmarkListViewProps } from "~/components/bookmarks/views/types";

export function BookmarkGridView({
  items,
  isLoading = false,
  actions,
}: BookmarkListViewProps) {
  return (
    <div
      className={`min-h-0 flex-1 overflow-y-auto${isLoading ? " opacity-60" : ""}`}
    >
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 p-3">
        {items.map((bookmarkItem) => (
          <BookmarkGridItemCard
            key={bookmarkItem.id}
            bookmarkItem={bookmarkItem}
            actions={actions}
          />
        ))}
      </div>
      {isLoading && items.length > 0 ? (
        <p className="pb-3 text-center text-sm text-gray-500">Updating...</p>
      ) : null}
    </div>
  );
}
