import { BookmarkItemActions } from "~/components/bookmarks/BookmarkItemActions";
import {
  formatCreatedAtLabel,
  formatUrlDomain,
  getTagsLabel,
} from "~/components/bookmarks/formatBookmarkDisplay";
import type { BookmarkItemActions as BookmarkItemActionsBundle } from "~/components/bookmarks/views/types";
import type { BookmarkItem } from "~/lib/api/types";

type BookmarkGridItemCardProps = {
  bookmarkItem: BookmarkItem;
  actions: BookmarkItemActionsBundle;
};

export function BookmarkGridItemCard({
  bookmarkItem,
  actions,
}: BookmarkGridItemCardProps) {
  const tagsLabel = getTagsLabel(bookmarkItem);
  const urlDomain = formatUrlDomain(bookmarkItem.url);
  const updatingTitle = actions.updatingTitleId === bookmarkItem.id;

  return (
    <div className="group relative rounded border border-gray-200 hover:bg-gray-50">
      <a
        href={bookmarkItem.url}
        target="_blank"
        rel="noreferrer"
        className="block min-w-0 overflow-hidden p-3"
      >
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
