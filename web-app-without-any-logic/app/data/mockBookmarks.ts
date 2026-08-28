import type {
  BookmarkItem,
  BookmarkLabelSummary,
  BookmarkListScope,
  MockUser,
} from "~/lib/types";

export const MOCK_USER: MockUser = {
  displayName: "Demo User",
  email: "demo@example.com",
  photoURL: null,
};

const USER_ID = "demo-user";

export const MOCK_BOOKMARKS: BookmarkItem[] = [
  {
    id: "1",
    title: "React Router",
    url: "https://reactrouter.com",
    tags: ["react", "routing"],
    note: "Framework documentation",
    is_archived: false,
    userId: USER_ID,
    createdAt: "2026-08-20T10:00:00.000Z",
    updatedAt: "2026-08-20T10:00:00.000Z",
  },
  {
    id: "2",
    title: "Tailwind CSS",
    url: "https://tailwindcss.com",
    tags: ["css"],
    note: "",
    is_archived: false,
    userId: USER_ID,
    createdAt: "2026-08-21T14:30:00.000Z",
    updatedAt: "2026-08-21T14:30:00.000Z",
  },
  {
    id: "3",
    title: "MDN Web Docs",
    url: "https://developer.mozilla.org",
    tags: ["docs"],
    is_archived: false,
    userId: USER_ID,
    createdAt: "2026-08-22T09:15:00.000Z",
    updatedAt: "2026-08-22T09:15:00.000Z",
  },
  {
    id: "4",
    title: "Untitled note",
    url: "https://example.com/notes",
    is_archived: false,
    userId: USER_ID,
    createdAt: "2026-08-23T18:00:00.000Z",
    updatedAt: "2026-08-23T18:00:00.000Z",
  },
  {
    id: "5",
    title: "Old article",
    url: "https://example.com/archived",
    tags: ["react"],
    note: "Kept for later",
    is_archived: true,
    userId: USER_ID,
    createdAt: "2026-07-01T08:00:00.000Z",
    updatedAt: "2026-08-01T08:00:00.000Z",
  },
];

export const MOCK_LABELS: BookmarkLabelSummary[] = [
  { name: "react", count: 2 },
  { name: "routing", count: 1 },
  { name: "css", count: 1 },
  { name: "docs", count: 1 },
];

export const MOCK_PINNED_TAGS = ["react", "css"];

export function bookmarksForScope(scope: BookmarkListScope): BookmarkItem[] {
  if (scope === "archived") {
    return MOCK_BOOKMARKS.filter((item) => item.is_archived);
  }
  if (scope === "uncategorized") {
    return MOCK_BOOKMARKS.filter(
      (item) => !item.is_archived && (!item.tags || item.tags.length === 0),
    );
  }
  if (typeof scope === "object") {
    return MOCK_BOOKMARKS.filter(
      (item) => !item.is_archived && (item.tags ?? []).includes(scope.tag),
    );
  }
  return MOCK_BOOKMARKS.filter((item) => !item.is_archived);
}
