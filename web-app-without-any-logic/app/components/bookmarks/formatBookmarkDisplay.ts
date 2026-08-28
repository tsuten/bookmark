import type { BookmarkItem } from "~/lib/types";

export function formatCreatedAtLabel(createdAt: string) {
  const d = new Date(createdAt);
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (isToday) {
    return d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return d.toLocaleDateString(undefined, { month: "numeric", day: "numeric" });
}

export function formatUrlDomain(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function getTagsLabel(bookmarkItem: BookmarkItem) {
  return (bookmarkItem.tags ?? []).join(", ") || "No tags";
}
