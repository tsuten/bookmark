import { useState } from "react";
import { buildFaviconImageUrlFromBookmarkUrl } from "~/lib/api/favicons";

type BookmarkFaviconProps = {
  url: string;
};

export function BookmarkFavicon({ url }: BookmarkFaviconProps) {
  const faviconUrl = buildFaviconImageUrlFromBookmarkUrl(url);
  const [failed, setFailed] = useState(false);

  if (!faviconUrl || failed) {
    return (
      <span
        className="inline-block h-8 w-8 shrink-0 rounded bg-bg-main-hover"
        aria-hidden
      />
    );
  }

  return (
    <img
      src={faviconUrl}
      alt=""
      width={32}
      height={32}
      className="h-8 w-8 shrink-0 rounded object-contain"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
