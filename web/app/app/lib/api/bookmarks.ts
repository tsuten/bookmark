import { apiFetch } from "./client";
import type {
  BookmarkListResponse,
  BookmarkListScope,
  BookmarkTagsResponse,
} from "./types";

const SCOPE_PATH: Record<Exclude<BookmarkListScope, { tag: string }>, string> =
  {
    active: "/bookmarks",
    archived: "/bookmarks/archived",
    uncategorized: "/bookmarks/uncategorized",
  };

function scopePath(scope: BookmarkListScope): string {
  if (typeof scope === "object") {
    return `/bookmarks/tags/${encodeURIComponent(scope.tag)}`;
  }
  return SCOPE_PATH[scope];
}

export async function fetchBookmarkPage(
  token: string,
  scope: BookmarkListScope,
  page: number,
  limit = 100,
): Promise<BookmarkListResponse> {
  const base = scopePath(scope);
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return apiFetch<BookmarkListResponse>(`${base}?${params}`, { token });
}

export async function fetchAllBookmarks(
  token: string,
  scope: BookmarkListScope,
): Promise<BookmarkListResponse["items"]> {
  const limit = 100;
  let page = 1;
  let totalPages = 1;
  const items: BookmarkListResponse["items"] = [];

  while (page <= totalPages) {
    const response = await fetchBookmarkPage(token, scope, page, limit);
    items.push(...response.items);
    totalPages = response.totalPages;
    page += 1;
  }

  return items;
}

export async function fetchBookmarkTags(token: string): Promise<string[]> {
  const response = await apiFetch<BookmarkTagsResponse>("/bookmarks/tags", {
    token,
  });
  return response.tags;
}

export async function createBookmark(
  token: string,
  input: { url: string; title?: string },
): Promise<void> {
  await apiFetch<{ ok: true }>("/bookmarks", {
    token,
    method: "POST",
    body: {
      url: input.url.trim(),
      title: input.title?.trimStart() ?? input.url.trimStart(),
    },
  });
}

export async function updateBookmark(
  token: string,
  id: string,
  input: { title: string; url: string; tags: string[] },
): Promise<void> {
  await apiFetch<{ ok: true }>(`/bookmarks/${id}`, {
    token,
    method: "PATCH",
    body: {
      title: input.title,
      url: input.url.trim(),
      tags: input.tags,
    },
  });
}

export async function archiveBookmark(
  token: string,
  id: string,
): Promise<void> {
  await apiFetch<{ ok: true }>(`/bookmarks/${id}/archive`, {
    token,
    method: "PATCH",
    body: {},
  });
}
