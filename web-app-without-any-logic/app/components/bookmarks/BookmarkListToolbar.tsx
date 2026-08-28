import { Bookmark, Search } from "lucide-react";
import { Dropdown } from "~/components/molecules/Dropdown";
import { InputWithIcon } from "~/components/molecules/InputWithIcon";
import {
  GRID_COLUMN_OPTIONS,
  SORT_OPTIONS,
  VIEW_OPTIONS,
  type GridColumnMode,
  type SortMode,
  type ViewMode,
} from "~/components/bookmarks/bookmarkListConstants";
import { PasteBookmarkButton } from "~/components/layout/Header";

type BookmarkListToolbarProps = {
  title: string;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  sortBy: SortMode;
  viewMode: ViewMode;
  gridColumns: GridColumnMode;
  onSortChange: (value: SortMode) => void;
  onViewChange: (value: ViewMode) => void;
  onGridColumnsChange: (value: GridColumnMode) => void;
};

export function BookmarkListToolbar({
  title,
  searchQuery,
  onSearchQueryChange,
  sortBy,
  viewMode,
  gridColumns,
  onSortChange,
  onViewChange,
  onGridColumnsChange,
}: BookmarkListToolbarProps) {
  return (
    <div className="bookmark-list-toolbar">
      <div className="bookmark-list-toolbar-title">
        <Bookmark className="h-4 w-4 shrink-0" />
        <h2>{title}</h2>
      </div>
      <div className="bookmark-list-toolbar-search">
        <InputWithIcon
          icon={<Search className="h-4 w-4" />}
          placeholder="Search bookmarks..."
          aria-label="Search bookmarks"
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
        />
      </div>
      <div className="bookmark-list-toolbar-actions">
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
        <PasteBookmarkButton />
      </div>
    </div>
  );
}
