import { Loader2 } from "lucide-react";
import { BookmarkGridItemCard } from "~/components/bookmarks/items/BookmarkGridItemCard";
import type { BookmarkGridViewProps } from "~/components/bookmarks/views/types";

function gridStyle(gridColumns: BookmarkGridViewProps["gridColumns"]) {
  if (gridColumns === "auto") {
    return undefined;
  }

  return {
    gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
  };
}

export function BookmarkGridView({
  items,
  isLoading = false,
  actions,
  gridColumns,
}: BookmarkGridViewProps) {
  const gridClassName =
    gridColumns === "auto"
      ? "grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3"
      : "grid gap-3";

  return (
    <div
      className={`min-h-0 flex-1 overflow-y-auto pb-16${isLoading ? " opacity-60" : ""}`}
    >
      <div className={`p-3 ${gridClassName}`} style={gridStyle(gridColumns)}>
        {items.map((bookmarkItem) => (
          <BookmarkGridItemCard
            key={bookmarkItem.id}
            bookmarkItem={bookmarkItem}
            actions={actions}
          />
        ))}
      </div>
      {isLoading && items.length > 0 ? (
        <div className="flex justify-center pb-3 text-gray-500">
          <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
        </div>
      ) : null}
    </div>
  );
}
