import { Loader2 } from "lucide-react";
import type { GridColumnMode, ViewMode } from "~/components/bookmarks/bookmarkListConstants";
import { BookmarkGridView } from "~/components/bookmarks/views/BookmarkGridView";
import { BookmarkListView } from "~/components/bookmarks/views/BookmarkListView";
import type { BookmarkItemActions } from "~/components/bookmarks/views/types";
import type { BookmarkItem } from "~/lib/api/types";

type BookmarkListItemsProps = {
  items: BookmarkItem[];
  viewMode: ViewMode;
  gridColumns: GridColumnMode;
  isLoading?: boolean;
  error?: string | null;
  actions: BookmarkItemActions;
};

export function BookmarkListItems({
  items,
  viewMode,
  gridColumns,
  isLoading = false,
  error = null,
  actions,
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
        <Loader2 aria-hidden className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (viewMode === "grid") {
    return (
      <BookmarkGridView
        items={items}
        isLoading={isLoading}
        actions={actions}
        gridColumns={gridColumns}
      />
    );
  }

  return (
    <BookmarkListView items={items} isLoading={isLoading} actions={actions} />
  );
}
