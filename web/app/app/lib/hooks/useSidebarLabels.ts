import { useCallback, useEffect, useRef, useState } from "react";
import { fetchBookmarkTags, patchPinnedTags } from "~/lib/api/bookmarks";

function sameStringArray(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

export type UseSidebarLabelsResult = {
  labels: string[];
  pinned: string[];
  updatePinned: (updater: (current: string[]) => string[]) => void;
};

export function useSidebarLabels(
  userId: string | undefined,
  getIdToken: () => Promise<string | null>,
  refetchKey: unknown,
): UseSidebarLabelsResult {
  const [labels, setLabels] = useState<string[]>([]);
  const [pinned, setPinnedState] = useState<string[]>([]);
  const pinnedRef = useRef<string[]>([]);
  const saveQueueRef = useRef(Promise.resolve());
  const initialLoadDoneRef = useRef(false);
  const prevRefetchKeyRef = useRef<unknown>(undefined);
  const getIdTokenRef = useRef(getIdToken);
  const refetchKeyRef = useRef(refetchKey);

  getIdTokenRef.current = getIdToken;
  refetchKeyRef.current = refetchKey;

  const setPinned = useCallback((next: string[]) => {
    pinnedRef.current = next;
    setPinnedState(next);
  }, []);

  const enqueueSave = useCallback(() => {
    const payload = pinnedRef.current;
    if (new Set(payload).size !== payload.length) {
      console.error("[sidebar-labels] PATCH skipped (duplicate tags)", {
        pinned_tags: payload,
      });
      return;
    }
    saveQueueRef.current = saveQueueRef.current
      .catch(() => undefined)
      .then(async () => {
        const token = await getIdTokenRef.current();
        if (!token) {
          throw new Error("Missing auth token.");
        }
        await patchPinnedTags(token, pinnedRef.current);
      })
      .catch((error) => {
        console.error("[sidebar-labels] PATCH failed:", error);
      });
  }, []);

  const updatePinned = useCallback(
    (updater: (current: string[]) => string[]) => {
      setPinnedState((prev) => {
        const next = updater(prev);
        if (sameStringArray(next, prev)) {
          return prev;
        }
        pinnedRef.current = next;
        enqueueSave();
        return next;
      });
    },
    [enqueueSave],
  );

  useEffect(() => {
    if (!userId) {
      initialLoadDoneRef.current = false;
      prevRefetchKeyRef.current = undefined;
      saveQueueRef.current = Promise.resolve();
      setLabels([]);
      setPinned([]);
      return;
    }

    initialLoadDoneRef.current = false;
    prevRefetchKeyRef.current = undefined;
    let cancelled = false;

    async function loadInitial() {
      try {
        const token = await getIdTokenRef.current();
        if (!token || cancelled) {
          return;
        }
        const response = await fetchBookmarkTags(token);
        if (!cancelled) {
          setLabels(response.tags);
          setPinned(response.pinned_tags);
          initialLoadDoneRef.current = true;
          prevRefetchKeyRef.current = refetchKeyRef.current;
        }
      } catch (error) {
        console.error("[sidebar-labels] GET initial load failed:", error);
      }
    }

    loadInitial();

    return () => {
      cancelled = true;
    };
  }, [userId, setPinned]);

  useEffect(() => {
    if (!userId || !initialLoadDoneRef.current) {
      return;
    }

    const previousRefetchKey = prevRefetchKeyRef.current;
    if (previousRefetchKey === refetchKey) {
      return;
    }

    prevRefetchKeyRef.current = refetchKey;

    if (refetchKey !== "idle") {
      return;
    }

    let cancelled = false;

    async function refreshTags() {
      try {
        const token = await getIdTokenRef.current();
        if (!token || cancelled) {
          return;
        }
        const response = await fetchBookmarkTags(token);
        if (!cancelled) {
          setLabels(response.tags);
        }
      } catch (error) {
        console.error("[sidebar-labels] GET tags refresh failed:", error);
      }
    }

    refreshTags();

    return () => {
      cancelled = true;
    };
  }, [refetchKey, userId]);

  return { labels, pinned, updatePinned };
}
