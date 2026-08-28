import type { BookmarkItem } from "~/lib/types";
import type { GridColumnMode } from "~/components/bookmarks/bookmarkListConstants";

export type BookmarkItemActions = {
  onEdit: (bookmark: BookmarkItem) => void;
  onArchive: (bookmark: BookmarkItem) => void;
  onRestore: (bookmark: BookmarkItem) => void;
  onUpdateTitle: (bookmark: BookmarkItem) => void;
  updatingTitleId: string | null;
};

export type BookmarkListViewProps = {
  items: BookmarkItem[];
  isLoading?: boolean;
  actions: BookmarkItemActions;
};

export type BookmarkGridViewProps = BookmarkListViewProps & {
  gridColumns: GridColumnMode;
};
