export type BookmarkItem = {
  _id: string;
  title: string;
  url: string;
  tags?: string[];
  note?: string;
  is_archived: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type BookmarkListResponse = {
  items: BookmarkItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type BookmarkTagsResponse = {
  tags: string[];
};

export type ApiErrorResponse = {
  error: string;
  message: string;
};

export type BookmarkListScope =
  | "active"
  | "archived"
  | "uncategorized"
  | { tag: string };
