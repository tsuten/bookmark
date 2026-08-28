import { useState } from "react";

type BookmarkFaviconProps = {
  url: string;
};

function faviconSrc(url: string) {
  try {
    const hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`;
  } catch {
    return "";
  }
}

export function BookmarkFavicon({ url }: BookmarkFaviconProps) {
  const src = faviconSrc(url);
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span
        className="inline-block h-8 w-8 shrink-0 rounded bg-bg-main-hover"
        aria-hidden
      />
    );
  }

  return (
    <img
      src={src}
      alt=""
      width={32}
      height={32}
      className="h-8 w-8 shrink-0 rounded object-contain"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
