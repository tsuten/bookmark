import type { Route } from "./+types/home";
import { loadBookmarksForScope } from "~/lib/api/loaders";

export const handle = {
  title: "All Bookmarks",
};

export async function clientLoader() {
  return loadBookmarksForScope("active");
}

export default function HomeRoute(_props: Route.ComponentProps) {
  return null;
}
