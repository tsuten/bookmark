import {
  ArrowDownAZ,
  ArrowUpAZ,
  ClockArrowDown,
  ClockArrowUp,
  Columns2,
  Columns3,
  Columns4,
  LayoutGrid,
  List,
} from "lucide-react";
import type { BookmarkItem } from "~/lib/types";

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest", Icon: ClockArrowDown },
  { value: "oldest", label: "Oldest", Icon: ClockArrowUp },
  { value: "az", label: "A-Z", Icon: ArrowUpAZ },
  { value: "za", label: "Z-A", Icon: ArrowDownAZ },
] as const;

export type SortMode = (typeof SORT_OPTIONS)[number]["value"];

export const VIEW_OPTIONS = [
  { value: "list", label: "List", Icon: List },
  { value: "grid", label: "Grid", Icon: LayoutGrid },
] as const;

export type ViewMode = (typeof VIEW_OPTIONS)[number]["value"];

export const GRID_COLUMN_OPTIONS = [
  { value: "auto", label: "Auto", Icon: LayoutGrid },
  { value: "2", label: "2 columns", Icon: Columns2 },
  { value: "3", label: "3 columns", Icon: Columns3 },
  { value: "4", label: "4 columns", Icon: Columns4 },
  { value: "5", label: "5 columns", Icon: Columns4 },
  { value: "6", label: "6 columns", Icon: Columns4 },
] as const;

export type GridColumnMode = (typeof GRID_COLUMN_OPTIONS)[number]["value"];

export const DEFAULT_GRID_COLUMN_MODE: GridColumnMode = "auto";

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
