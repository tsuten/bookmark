import type { Route } from "./+types/uncategorized";
import { BookmarkListPage } from "~/components/bookmarks/BookmarkListPage";
import { loadBookmarksForScope } from "~/lib/api/loaders";

export async function clientLoader() {
  return loadBookmarksForScope("uncategorized");
}

export default function UncategorizedBookmarksPage({
  loaderData,
}: Route.ComponentProps) {
  return (
    <BookmarkListPage
      title="Uncategorized Bookmarks"
      items={loaderData.items}
      error={loaderData.error}
    />
  );
}
