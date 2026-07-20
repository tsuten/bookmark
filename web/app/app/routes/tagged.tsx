import type { Route } from "./+types/tagged";
import { loadBookmarksForScope } from "~/lib/api/loaders";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const tag = params.tag ? decodeURIComponent(params.tag) : "";
  return loadBookmarksForScope({ tag });
}

export default function TaggedRoute() {
  return null;
}
