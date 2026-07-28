import { Bookmark } from "lucide-react";
import { Dropdown } from "~/components/molecules/Dropdown";
import {
  SORT_OPTIONS,
  VIEW_OPTIONS,
  type SortMode,
  type ViewMode,
} from "~/components/bookmarks/bookmarkListConstants";

type BookmarkListToolbarProps = {
  title: string;
  sortBy: SortMode;
  viewMode: ViewMode;
  onSortChange: (value: SortMode) => void;
  onViewChange: (value: ViewMode) => void;
};

export function BookmarkListToolbar({
  title,
  sortBy,
  viewMode,
  onSortChange,
  onViewChange,
}: BookmarkListToolbarProps) {
  return (
    <div className="shrink-0">
      <div className="flex flex-row items-center justify-between gap-2 mr-2 ml-1">
        <div className="m-2 flex flex-row items-center gap-2">
          <Bookmark className="h-4 w-4" />
          <h2>{title}</h2>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Dropdown
            options={[...VIEW_OPTIONS]}
            value={viewMode}
            onValueChange={(value) => onViewChange(value as ViewMode)}
          />
          <Dropdown
            options={[...SORT_OPTIONS]}
            value={sortBy}
            onValueChange={(value) => onSortChange(value as SortMode)}
          />
        </div>
      </div>
      <hr />
    </div>
  );
}
