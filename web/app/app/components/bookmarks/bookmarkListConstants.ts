import {
  ArrowDownAZ,
  ArrowUpAZ,
  ClockArrowDown,
  ClockArrowUp,
} from "lucide-react";
import type { BookmarkItem } from "~/lib/api/types";

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest", Icon: ClockArrowDown },
  { value: "oldest", label: "Oldest", Icon: ClockArrowUp },
  { value: "az", label: "A-Z", Icon: ArrowUpAZ },
  { value: "za", label: "Z-A", Icon: ArrowDownAZ },
] as const;

export type SortMode = (typeof SORT_OPTIONS)[number]["value"];

function compareNullableStrings(a: string | undefined, b: string | undefined) {
  return (a || "").localeCompare(b || "");
}

function compareDates(a: string, b: string) {
  return new Date(a || 0).getTime() - new Date(b || 0).getTime();
}

export function compareForMode(mode: SortMode) {
  switch (mode) {
    case "newest":
      return (a: BookmarkItem, b: BookmarkItem) =>
        compareDates(b.createdAt, a.createdAt);
    case "oldest":
      return (a: BookmarkItem, b: BookmarkItem) =>
        compareDates(a.createdAt, b.createdAt);
    case "az":
      return (a: BookmarkItem, b: BookmarkItem) =>
        compareNullableStrings(a.title, b.title);
    case "za":
      return (a: BookmarkItem, b: BookmarkItem) =>
        compareNullableStrings(b.title, a.title);
    default:
      return (a: BookmarkItem, b: BookmarkItem) =>
        compareDates(b.createdAt, a.createdAt);
  }
}
