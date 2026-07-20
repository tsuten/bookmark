import { Bookmark } from "lucide-react";
import { Dropdown } from "~/components/molecules/Dropdown";
import {
  SORT_OPTIONS,
  type SortMode,
} from "~/components/bookmarks/bookmarkListConstants";

type BookmarkListToolbarProps = {
  title: string;
  sortBy: SortMode;
  onSortChange: (value: SortMode) => void;
};

export function BookmarkListToolbar({
  title,
  sortBy,
  onSortChange,
}: BookmarkListToolbarProps) {
  return (
    <div className="shrink-0">
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="m-2 flex flex-row items-center gap-2">
          <Bookmark className="h-4 w-4" />
          <h2>{title}</h2>
        </div>
        <div className="flex flex-row items-center gap-2">
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
