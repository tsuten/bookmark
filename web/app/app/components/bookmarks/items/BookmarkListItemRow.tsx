import { BookmarkItemActions } from "~/components/bookmarks/BookmarkItemActions";
import {
  formatCreatedAtLabel,
  formatUrlDomain,
} from "~/components/bookmarks/formatBookmarkDisplay";
import type { BookmarkItemActions as BookmarkItemActionsBundle } from "~/components/bookmarks/views/types";
import type { BookmarkItem } from "~/lib/api/types";

type BookmarkListItemRowProps = {
  bookmarkItem: BookmarkItem;
  actions: BookmarkItemActionsBundle;
};

export function BookmarkListItemRow({
  bookmarkItem,
  actions,
}: BookmarkListItemRowProps) {
  const tags = bookmarkItem.tags ?? [];
  const urlDomain = formatUrlDomain(bookmarkItem.url);
  const updatingTitle = actions.updatingTitleId === bookmarkItem.id;

  return (
    <li>
      <div className="group flex min-w-0 flex-row justify-between gap-2 hover:bg-bg-main-hover">
        <a
          href={bookmarkItem.url}
          target="_blank"
          rel="noreferrer"
          className="min-w-0 flex-1 overflow-hidden"
        >
          <div className="flex min-w-0 flex-col p-3">
            <span className="truncate" title={bookmarkItem.title}>
              {bookmarkItem.title}
            </span>
            <div className="flex min-w-0 flex-row items-center gap-4">
              {tags.length > 0 ? (
                <div className="flex max-w-[40%] min-w-0 shrink flex-wrap items-center gap-1">
                  {tags.map((tag) => (
                    <span key={tag} className="bookmark-list-tag-chip max-w-full truncate" title={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
              <span
                className="min-w-0 truncate text-sm text-gray-500"
                title={bookmarkItem.url}
              >
                {urlDomain}
              </span>
              <span className="shrink-0 whitespace-nowrap text-sm text-gray-500">
                {formatCreatedAtLabel(bookmarkItem.createdAt)}
              </span>
            </div>
            {bookmarkItem.note ? (
              <span
                className="line-clamp-1 text-sm text-gray-500"
                title={bookmarkItem.note}
              >
                {bookmarkItem.note}
              </span>
            ) : null}
          </div>
        </a>
        <BookmarkItemActions
          bookmarkItem={bookmarkItem}
          onEdit={actions.onEdit}
          onArchive={actions.onArchive}
          onRestore={actions.onRestore}
          onUpdateTitle={actions.onUpdateTitle}
          updatingTitle={updatingTitle}
        />
      </div>
    </li>
  );
}
