import type { ComponentType } from "react";
import type { ViewMode } from "~/components/bookmarks/bookmarkListConstants";
import { BookmarkGridView } from "~/components/bookmarks/views/BookmarkGridView";
import { BookmarkListView } from "~/components/bookmarks/views/BookmarkListView";
import type {
  BookmarkItemActions,
  BookmarkListViewProps,
} from "~/components/bookmarks/views/types";
import type { BookmarkItem } from "~/lib/api/types";

const VIEW_COMPONENTS: Record<
  ViewMode,
  ComponentType<BookmarkListViewProps>
> = {
  list: BookmarkListView,
  grid: BookmarkGridView,
};

type BookmarkListItemsProps = {
  items: BookmarkItem[];
  viewMode: ViewMode;
  isLoading?: boolean;
  error?: string | null;
  actions: BookmarkItemActions;
};

export function BookmarkListItems({
  items,
  viewMode,
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
        Loading...
      </div>
    );
  }

  const View = VIEW_COMPONENTS[viewMode];

  return <View items={items} isLoading={isLoading} actions={actions} />;
}
