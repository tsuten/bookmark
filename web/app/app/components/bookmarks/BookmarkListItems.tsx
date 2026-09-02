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
  isLoadingMore?: boolean;
  hasMore?: boolean;
  error?: string | null;
  actions: BookmarkItemActions;
  onLoadMore?: () => void;
};

function LoadMoreControl({
  hasMore,
  isLoadingMore,
  onLoadMore,
}: {
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore?: () => void;
}) {
  if (!hasMore) {
    return null;
  }

  return (
    <div className="flex justify-center p-3">
      <button
        type="button"
        className="rounded-md bg-gray-100 px-3 py-2 text-sm disabled:opacity-50"
        disabled={isLoadingMore}
        onClick={onLoadMore}
      >
        {isLoadingMore ? (
          <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
        ) : (
          "Load more"
        )}
      </button>
    </div>
  );
}

export function BookmarkListItems({
  items,
  viewMode,
  gridColumns,
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  error = null,
  actions,
  onLoadMore,
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

  const footer = (
    <LoadMoreControl
      hasMore={hasMore}
      isLoadingMore={isLoadingMore}
      onLoadMore={onLoadMore}
    />
  );

  if (viewMode === "grid") {
    return (
      <BookmarkGridView
        items={items}
        isLoading={isLoading}
        actions={actions}
        gridColumns={gridColumns}
        footer={footer}
      />
    );
  }

  return (
    <BookmarkListView
      items={items}
      isLoading={isLoading}
      actions={actions}
      footer={footer}
    />
  );
}
