import { Bookmark } from "lucide-react";
import { Dropdown } from "~/components/molecules/Dropdown";
import {
  GRID_COLUMN_OPTIONS,
  SORT_OPTIONS,
  VIEW_OPTIONS,
  type GridColumnMode,
  type SortMode,
  type ViewMode,
} from "~/components/bookmarks/bookmarkListConstants";

type BookmarkListToolbarProps = {
  title: string;
  sortBy: SortMode;
  viewMode: ViewMode;
  gridColumns: GridColumnMode;
  onSortChange: (value: SortMode) => void;
  onViewChange: (value: ViewMode) => void;
  onGridColumnsChange: (value: GridColumnMode) => void;
};

export function BookmarkListToolbar({
  title,
  sortBy,
  viewMode,
  gridColumns,
  onSortChange,
  onViewChange,
  onGridColumnsChange,
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
          {viewMode === "grid" ? (
            <Dropdown
              options={[...GRID_COLUMN_OPTIONS]}
              value={gridColumns}
              onValueChange={(value) =>
                onGridColumnsChange(value as GridColumnMode)
              }
            />
          ) : null}
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
