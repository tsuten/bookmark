import { useEffect } from "react";
import { Outlet, useLocation, useMatches, useParams } from "react-router";
import { BookmarkList } from "~/components/bookmarks/BookmarkList";
import type { BookmarkListScope } from "~/lib/api/types";
import { useBookmarkItemsStore } from "~/stores/bookmarkItemsStore";

type BookmarkRouteHandle = {
  title?: string;
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

function resolveBookmarkScope(
  pathname: string,
  tag: string | undefined,
): BookmarkListScope {
  if (pathname === "/archived" || pathname.startsWith("/archived/")) {
    return "archived";
  }
  if (pathname === "/uncategorized" || pathname.startsWith("/uncategorized/")) {
    return "uncategorized";
  }
  if (tag) {
    return { tag: decodeURIComponent(tag) };
  }
  return "active";
}

export default function BookmarksLayout() {
  const matches = useMatches();
  const params = useParams();
  const { pathname } = useLocation();

  const leafMatch = matches.at(-1);
  const handle = leafMatch?.handle as BookmarkRouteHandle | undefined;
  const title = resolveBookmarkTitle(handle, params.tag);
  const { tag } = params;

  useEffect(() => {
    void useBookmarkItemsStore.getState().load(resolveBookmarkScope(pathname, tag));
  }, [pathname, tag]);

  return (
    <>
      <BookmarkList title={title} />
      <Outlet />
    </>
  );
}
