import { loadBookmarksForScope } from "~/lib/api/loaders";

export const handle = {
  title: "Uncategorized Bookmarks",
};

export async function clientLoader() {
  return loadBookmarksForScope("uncategorized");
}

export default function UncategorizedRoute() {
  return null;
}
