import type { Route } from "./+types/tagged";
import { BookmarkListPage } from "~/components/bookmarks/BookmarkListPage";
import { loadBookmarksForScope } from "~/lib/api/loaders";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const tag = params.tag ? decodeURIComponent(params.tag) : "";
  return loadBookmarksForScope({ tag });
}

export default function TaggedBookmarksPage({
  loaderData,
  params,
}: Route.ComponentProps) {
  const tag = params.tag ? decodeURIComponent(params.tag) : "";
  const title = tag ? `Bookmarks by tag: ${tag}` : "Bookmarks by tag";

  return (
    <BookmarkListPage
      title={title}
      items={loaderData.items}
      error={loaderData.error}
    />
  );
}
