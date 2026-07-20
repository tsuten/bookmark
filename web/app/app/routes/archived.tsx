import type { Route } from "./+types/archived";
import { BookmarkListPage } from "~/components/bookmarks/BookmarkListPage";
import { loadBookmarksForScope } from "~/lib/api/loaders";

export async function clientLoader() {
  return loadBookmarksForScope("archived");
}

export default function ArchivedBookmarksPage({
  loaderData,
}: Route.ComponentProps) {
  return (
    <BookmarkListPage
      title="Archived Bookmarks"
      items={loaderData.items}
      error={loaderData.error}
    />
  );
}
