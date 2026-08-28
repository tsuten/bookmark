export type BookmarkItem = {
  id: string;
  title: string;
  url: string;
  tags?: string[];
  note?: string;
  is_archived: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type BookmarkLabelSummary = {
  name: string;
  count: number;
};

export type BookmarkListScope =
  | "active"
  | "archived"
  | "uncategorized"
  | { tag: string };

export type MockUser = {
  displayName: string;
  email: string;
  photoURL: string | null;
};
