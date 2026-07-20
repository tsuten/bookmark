import { redirect } from "react-router";
import { getFirebaseAuth, isFirebaseConfigured } from "~/lib/auth/firebase";
import { ApiError } from "~/lib/api/client";
import type { BookmarkListScope } from "~/lib/api/types";
import { fetchAllBookmarks } from "~/lib/api/bookmarks";

export async function getAuthToken(): Promise<string> {
  if (!isFirebaseConfigured()) {
    throw redirect("/login");
  }

  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) {
    throw redirect("/login");
  }

  return user.getIdToken();
}

export async function loadBookmarksForScope(scope: BookmarkListScope) {
  try {
    const token = await getAuthToken();
    const items = await fetchAllBookmarks(token, scope);
    return { items, error: null as string | null };
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    if (error instanceof ApiError && error.status === 401) {
      throw redirect("/login");
    }
    const message =
      error instanceof ApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Failed to load bookmarks.";
    return { items: [], error: message };
  }
}
