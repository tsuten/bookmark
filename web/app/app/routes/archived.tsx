import { loadBookmarksForScope } from "~/lib/api/loaders";

export const handle = {
  title: "Archived Bookmarks",
};

export async function clientLoader() {
  return loadBookmarksForScope("archived");
}

export default function ArchivedRoute() {
  return null;
}
