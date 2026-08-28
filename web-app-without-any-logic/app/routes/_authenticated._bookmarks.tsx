import { Outlet, useMatches, useParams } from "react-router";
import { BookmarkList } from "~/components/bookmarks/BookmarkList";
import { bookmarksForScope } from "~/data/mockBookmarks";
import type { BookmarkListScope } from "~/lib/types";

type BookmarkRouteHandle = {
  title?: string;
  scope?: BookmarkListScope;
};

function resolveBookmarkTitle(
  handle: BookmarkRouteHandle | undefined,
  tag: string | undefined,
) {
  if (handle?.title) {
    return handle.title;
  }
  if (tag) {
    return `Bookmarks by tag: ${decodeURIComponent(tag)}`;
  }
  return "Bookmarks";
}

function resolveScope(
  handle: BookmarkRouteHandle | undefined,
  tag: string | undefined,
): BookmarkListScope {
  if (handle?.scope) {
    return handle.scope;
  }
  if (tag) {
    return { tag: decodeURIComponent(tag) };
  }
  return "active";
}

export default function BookmarksLayout() {
  const matches = useMatches();
  const params = useParams();
  const leafMatch = matches.at(-1);
  const handle = leafMatch?.handle as BookmarkRouteHandle | undefined;
  const title = resolveBookmarkTitle(handle, params.tag);
  const items = bookmarksForScope(resolveScope(handle, params.tag));

  return (
    <>
      <BookmarkList title={title} bookmarkItems={items} />
      <Outlet />
    </>
  );
}
