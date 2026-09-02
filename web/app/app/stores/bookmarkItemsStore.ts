// Comprehensive bookmark list store. May grow a bit thick.
// Keep list logic here so components only render.
// Pagination and sort changes must refetch from the API.
import { create } from "zustand";
import {
  archiveBookmark,
  createBookmark,
  fetchBookmarkPage,
  restoreBookmark,
  updateBookmark,
  updateBookmarkTitle,
} from "~/lib/api/bookmarks";
import { ApiError } from "~/lib/api/client";
import { fetchPageTitle } from "~/lib/api/getTitle";
import { getAuthToken } from "~/lib/api/loaders";
import type {
  BookmarkItem,
  BookmarkListScope,
  BookmarkListSort,
} from "~/lib/api/types";

const PAGE_SIZE = 20;

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

type BookmarkItemsState = {
  items: BookmarkItem[];
  scope: BookmarkListScope;
  sortBy: BookmarkListSort;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  updatingTitleId: string | null;
  version: number;
  requestId: number;
  load: (scope: BookmarkListScope) => Promise<void>;
  setSort: (sortBy: BookmarkListSort) => Promise<void>;
  loadMore: () => Promise<void>;
  create: (input: { url: string }) => Promise<void>;
  update: (
    id: string,
    input: { title: string; url: string; tags: string[]; note?: string },
  ) => Promise<void>;
  archive: (bookmark: BookmarkItem) => Promise<void>;
  restore: (bookmark: BookmarkItem) => Promise<void>;
  updateTitle: (bookmark: BookmarkItem) => Promise<void>;
};

async function fetchLoadedPages(
  scope: BookmarkListScope,
  sortBy: BookmarkListSort,
  limit: number,
  pageCount: number,
): Promise<{
  items: BookmarkItem[];
  page: number;
  total: number;
  totalPages: number;
}> {
  const token = await getAuthToken();
  const pagesToFetch = Math.max(1, pageCount);
  const responses = await Promise.all(
    Array.from({ length: pagesToFetch }, (_, index) =>
      fetchBookmarkPage(token, scope, index + 1, limit, sortBy),
    ),
  );

  const last = responses[responses.length - 1];
  const totalPages = last?.totalPages ?? 0;
  const kept = totalPages === 0 ? [] : responses.slice(0, totalPages);

  return {
    items: kept.flatMap((response) => response.items),
    page: kept.length === 0 ? 1 : kept.length,
    total: last?.total ?? 0,
    totalPages,
  };
}

export const useBookmarkItemsStore = create<BookmarkItemsState>((set, get) => ({
  items: [],
  scope: "active",
  sortBy: "newest",
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPages: 0,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  updatingTitleId: null,
  version: 0,
  requestId: 0,

  async load(scope) {
    const requestId = get().requestId + 1;
    set({
      requestId,
      scope,
      items: [],
      page: 1,
      isLoading: true,
      isLoadingMore: false,
      error: null,
    });

    try {
      const { sortBy, limit } = get();
      const token = await getAuthToken();
      const response = await fetchBookmarkPage(token, scope, 1, limit, sortBy);
      if (get().requestId !== requestId) {
        return;
      }
      set({
        items: response.items,
        page: 1,
        total: response.total,
        totalPages: response.totalPages,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      if (get().requestId !== requestId) {
        return;
      }
      set({
        items: [],
        isLoading: false,
        error: errorMessage(error, "Failed to load bookmarks."),
      });
    }
  },

  async setSort(sortBy) {
    if (sortBy === get().sortBy) {
      return;
    }

    const requestId = get().requestId + 1;
    const { scope, limit } = get();
    set({
      requestId,
      sortBy,
      items: [],
      page: 1,
      isLoading: true,
      isLoadingMore: false,
      error: null,
    });

    try {
      const token = await getAuthToken();
      const response = await fetchBookmarkPage(token, scope, 1, limit, sortBy);
      if (get().requestId !== requestId) {
        return;
      }
      set({
        items: response.items,
        page: 1,
        total: response.total,
        totalPages: response.totalPages,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      if (get().requestId !== requestId) {
        return;
      }
      set({
        items: [],
        isLoading: false,
        error: errorMessage(error, "Failed to load bookmarks."),
      });
    }
  },

  async loadMore() {
    const {
      page,
      totalPages,
      isLoading,
      isLoadingMore,
      scope,
      sortBy,
      limit,
      items,
    } = get();
    if (isLoading || isLoadingMore || page >= totalPages) {
      return;
    }

    const requestId = get().requestId + 1;
    const nextPage = page + 1;
    set({ requestId, isLoadingMore: true, error: null });

    try {
      const token = await getAuthToken();
      const response = await fetchBookmarkPage(
        token,
        scope,
        nextPage,
        limit,
        sortBy,
      );
      if (get().requestId !== requestId) {
        return;
      }
      set({
        items: [...items, ...response.items],
        page: nextPage,
        total: response.total,
        totalPages: response.totalPages,
        isLoadingMore: false,
      });
    } catch (error) {
      if (get().requestId !== requestId) {
        return;
      }
      set({
        isLoadingMore: false,
        error: errorMessage(error, "Failed to load bookmarks."),
      });
    }
  },

  async create(input) {
    const token = await getAuthToken();
    await createBookmark(token, input);
    await reloadAfterMutation(set, get);
  },

  async update(id, input) {
    const token = await getAuthToken();
    await updateBookmark(token, id, input);
    await reloadAfterMutation(set, get);
  },

  async archive(bookmark) {
    try {
      const token = await getAuthToken();
      await archiveBookmark(token, bookmark.id);
      await reloadAfterMutation(set, get);
    } catch (error) {
      console.error("[bookmark] archive failed:", error);
    }
  },

  async restore(bookmark) {
    try {
      const token = await getAuthToken();
      await restoreBookmark(token, bookmark.id);
      await reloadAfterMutation(set, get);
    } catch (error) {
      console.error("[bookmark] restore failed:", error);
    }
  },

  async updateTitle(bookmark) {
    set({ updatingTitleId: bookmark.id });
    try {
      const token = await getAuthToken();
      const title = await fetchPageTitle(token, bookmark.url);
      if (!title) {
        console.error("[bookmark] title not found:", bookmark.url);
        return;
      }
      await updateBookmarkTitle(token, bookmark.id, title);
      await reloadAfterMutation(set, get);
    } catch (error) {
      console.error(
        "[bookmark] update title failed:",
        error instanceof ApiError ? error.message : error,
      );
    } finally {
      if (get().updatingTitleId === bookmark.id) {
        set({ updatingTitleId: null });
      }
    }
  },
}));

async function reloadAfterMutation(
  set: (
    partial:
      | Partial<BookmarkItemsState>
      | ((state: BookmarkItemsState) => Partial<BookmarkItemsState>),
  ) => void,
  get: () => BookmarkItemsState,
) {
  const requestId = get().requestId + 1;
  const { scope, sortBy, limit, page } = get();
  set({ requestId, version: get().version + 1, isLoading: true, error: null });

  try {
    const loaded = await fetchLoadedPages(scope, sortBy, limit, page);
    if (get().requestId !== requestId) {
      return;
    }
    set({
      items: loaded.items,
      page: loaded.page,
      total: loaded.total,
      totalPages: loaded.totalPages,
      isLoading: false,
    });
  } catch (error) {
    if (get().requestId !== requestId) {
      return;
    }
    set({
      isLoading: false,
      error: errorMessage(error, "Failed to load bookmarks."),
    });
  }
}
