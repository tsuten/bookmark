import { getApiUrl } from "./client";

export function buildFaviconImageUrlFromBookmarkUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `${getApiUrl()}/favicons/${encodeURIComponent(domain)}`;
  } catch {
    return "";
  }
}
