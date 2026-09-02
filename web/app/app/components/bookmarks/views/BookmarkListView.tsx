import { Loader2 } from "lucide-react";
import { Fragment } from "react";
import { BookmarkItemActions } from "~/components/bookmarks/BookmarkItemActions";
import { BookmarkFavicon } from "~/components/bookmarks/BookmarkFavicon";
import {
  formatCreatedAtLabel,
  formatUrlDomain,
} from "~/components/bookmarks/formatBookmarkDisplay";
import type { BookmarkListViewProps } from "~/components/bookmarks/views/types";
import type { BookmarkItem } from "~/lib/api/types";

function BookmarkListItemRow({
  bookmarkItem,
  actions,
}: {
  bookmarkItem: BookmarkItem;
  actions: BookmarkListViewProps["actions"];
}) {
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
          className="flex min-w-0 flex-1 flex-row items-center gap-3 overflow-hidden p-3"
        >
          <BookmarkFavicon url={bookmarkItem.url} />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate" title={bookmarkItem.title}>
              {bookmarkItem.title}
            </span>
            <div className="flex min-w-0 flex-row items-center gap-4">
              {tags.length > 0 ? (
                <div className="flex max-w-[40%] min-w-0 shrink flex-wrap items-center gap-1">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="bookmark-list-tag-chip max-w-full truncate"
                      title={tag}
                    >
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

export function BookmarkListView({
  items,
  isLoading = false,
  actions,
  footer,
}: BookmarkListViewProps) {
  return (
    <ul
      className={`min-h-0 flex-1 overflow-y-auto pb-16${isLoading ? " opacity-60" : ""}`}
    >
      {items.map((bookmarkItem) => (
        <Fragment key={bookmarkItem.id}>
          <BookmarkListItemRow bookmarkItem={bookmarkItem} actions={actions} />
          <hr />
        </Fragment>
      ))}
      {isLoading && items.length > 0 ? (
        <li className="flex justify-center p-3 text-gray-500">
          <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
        </li>
      ) : null}
      {footer ? <li className="list-none">{footer}</li> : null}
    </ul>
  );
}
