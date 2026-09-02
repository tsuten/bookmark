import type { ReactNode } from "react";
import type { GridColumnMode } from "~/components/bookmarks/bookmarkListConstants";
import type { BookmarkItem } from "~/lib/api/types";

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
  footer?: ReactNode;
};

export type BookmarkGridViewProps = BookmarkListViewProps & {
  gridColumns: GridColumnMode;
};
