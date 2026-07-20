import { Outlet, useMatches, useNavigation, useParams, useRevalidator, useRouteLoaderData } from "react-router";
import { BookmarkList } from "~/components/bookmarks/BookmarkList";
import type { BookmarkItem } from "~/lib/api/types";

type BookmarkRouteHandle = {
  title?: string;
};

type BookmarkLoaderData = {
  items: BookmarkItem[];
  error: string | null;
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

export default function BookmarksLayout() {
  const matches = useMatches();
  const params = useParams();
  const navigation = useNavigation();
  const revalidator = useRevalidator();

  const leafMatch = matches.at(-1);
  const handle = leafMatch?.handle as BookmarkRouteHandle | undefined;
  const loaderData = useRouteLoaderData(
    leafMatch?.id ?? "",
  ) as BookmarkLoaderData | undefined;

  const title = resolveBookmarkTitle(handle, params.tag);
  const isLoading = navigation.state === "loading";

  return (
    <>
      <BookmarkList
        title={title}
        bookmarkItems={loaderData?.items ?? []}
        isLoading={isLoading}
        error={loaderData?.error ?? null}
        onMutate={() => revalidator.revalidate()}
      />
      <Outlet />
    </>
  );
}
