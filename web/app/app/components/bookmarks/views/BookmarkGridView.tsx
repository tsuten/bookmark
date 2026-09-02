import { Loader2 } from "lucide-react";
import { BookmarkFavicon } from "~/components/bookmarks/BookmarkFavicon";
import { BookmarkItemActions } from "~/components/bookmarks/BookmarkItemActions";
import {
  formatCreatedAtLabel,
  formatUrlDomain,
  getTagsLabel,
} from "~/components/bookmarks/formatBookmarkDisplay";
import type { BookmarkGridViewProps } from "~/components/bookmarks/views/types";
import type { BookmarkItem } from "~/lib/api/types";

function gridStyle(gridColumns: BookmarkGridViewProps["gridColumns"]) {
  if (gridColumns === "auto") {
    return undefined;
  }

  return {
    gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
  };
}

function BookmarkGridItemCard({
  bookmarkItem,
  actions,
}: {
  bookmarkItem: BookmarkItem;
  actions: BookmarkGridViewProps["actions"];
}) {
  const tagsLabel = getTagsLabel(bookmarkItem);
  const urlDomain = formatUrlDomain(bookmarkItem.url);
  const updatingTitle = actions.updatingTitleId === bookmarkItem.id;

  return (
    <div className="group relative rounded border border-gray-200 hover:bg-bg-main-hover">
      <a
        href={bookmarkItem.url}
        target="_blank"
        rel="noreferrer"
        className="flex min-w-0 items-start gap-3 overflow-hidden p-3"
      >
        <BookmarkFavicon url={bookmarkItem.url} />
        <div className="min-w-0 flex-1">
          <span className="block truncate font-medium" title={bookmarkItem.title}>
            {bookmarkItem.title}
          </span>
          <span
            className="mt-1 block truncate text-sm text-gray-500"
            title={bookmarkItem.url}
          >
            {urlDomain}
          </span>
          <span
            className="mt-1 block truncate text-sm text-gray-500"
            title={tagsLabel}
          >
            {tagsLabel}
          </span>
          <span className="mt-2 block text-sm text-gray-500">
            {formatCreatedAtLabel(bookmarkItem.createdAt)}
          </span>
        </div>
      </a>
      <BookmarkItemActions
        bookmarkItem={bookmarkItem}
        onEdit={actions.onEdit}
        onArchive={actions.onArchive}
        onRestore={actions.onRestore}
        onUpdateTitle={actions.onUpdateTitle}
        updatingTitle={updatingTitle}
        className="absolute right-1 top-1 hidden items-center gap-1 rounded bg-white/90 group-hover:flex"
      />
    </div>
  );
}

export function BookmarkGridView({
  items,
  isLoading = false,
  actions,
  gridColumns,
  footer,
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
      {footer}
    </div>
  );
}
