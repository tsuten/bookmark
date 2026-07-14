const FETCH_TIMEOUT_MS = 10_000;
const MAX_ASSET_BYTES = 5 * 1024 * 1024;
const MAX_HTML_BYTES = 1 * 1024 * 1024;

const EXT_BY_CONTENT_TYPE = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/x-icon': 'ico',
  'image/vnd.microsoft.icon': 'ico',
};

function decodeHtmlEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

export function extractMetaContent(html, name) {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']+)["']`,
      'i'
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${name}["']`,
      'i'
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return decodeHtmlEntities(match[1].trim());
    }
  }

  return null;
}

export function extractFaviconHref(html, pageUrl) {
  const linkTags = html.match(/<link\b[^>]*>/gi) || [];

  for (const tag of linkTags) {
    const relMatch = tag.match(/\brel=["']([^"']+)["']/i);
    if (!relMatch) continue;

    const rel = relMatch[1].toLowerCase();
    if (!rel.includes('icon')) continue;

    const hrefMatch = tag.match(/\bhref=["']([^"']+)["']/i);
    if (!hrefMatch) continue;

    return resolveAssetUrl(hrefMatch[1], pageUrl);
  }

  return resolveAssetUrl('/favicon.ico', pageUrl);
}

export function resolveAssetUrl(assetUrl, pageUrl) {
  try {
    return new URL(assetUrl, pageUrl).toString();
  } catch {
    return null;
  }
}

function extensionFromContentType(contentType) {
  const normalized = contentType?.split(';')[0]?.trim().toLowerCase();
  return EXT_BY_CONTENT_TYPE[normalized] || null;
}

function extensionFromUrl(assetUrl) {
  try {
    const pathname = new URL(assetUrl).pathname;
    const match = pathname.match(/\.([a-z0-9]+)$/i);
    return match?.[1]?.toLowerCase() || null;
  } catch {
    return null;
  }
}

function resolveExtension(contentType, assetUrl, fallback) {
  return (
    extensionFromContentType(contentType) ||
    extensionFromUrl(assetUrl) ||
    fallback
  );
}

async function readResponseWithLimit(response, maxBytes) {
  const contentLength = Number(response.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new Error(`Response exceeds ${maxBytes} bytes`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > maxBytes) {
      throw new Error(`Response exceeds ${maxBytes} bytes`);
    }
    return Buffer.from(arrayBuffer);
  }

  const chunks = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      throw new Error(`Response exceeds ${maxBytes} bytes`);
    }

    chunks.push(Buffer.from(value));
  }

  return Buffer.concat(chunks);
}

async function fetchWithTimeout(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: {
      'User-Agent': 'Bookie/1.0 (+https://github.com/bookie)',
      Accept: options.accept || '*/*',
      ...(options.headers || {}),
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response;
}

export async function scrapePageMetadata(pageUrl) {
  const response = await fetchWithTimeout(pageUrl, {
    accept: 'text/html,application/xhtml+xml',
    headers: {
      Accept: 'text/html,application/xhtml+xml',
    },
  });

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return {
      ogTitle: null,
      ogDescription: null,
      previewImageUrl: null,
      faviconUrl: resolveAssetUrl('/favicon.ico', pageUrl),
    };
  }

  const htmlBuffer = await readResponseWithLimit(response, MAX_HTML_BYTES);
  const html = htmlBuffer.toString('utf8');

  const ogImage = extractMetaContent(html, 'og:image');
  const twitterImage = extractMetaContent(html, 'twitter:image');

  return {
    ogTitle:
      extractMetaContent(html, 'og:title') ||
      extractMetaContent(html, 'twitter:title'),
    ogDescription:
      extractMetaContent(html, 'og:description') ||
      extractMetaContent(html, 'twitter:description') ||
      extractMetaContent(html, 'description'),
    previewImageUrl: resolveAssetUrl(ogImage || twitterImage, pageUrl),
    faviconUrl: extractFaviconHref(html, pageUrl),
  };
}

export async function downloadAsset(assetUrl, pageUrl) {
  const resolvedUrl = resolveAssetUrl(assetUrl, pageUrl);
  if (!resolvedUrl) {
    return null;
  }

  const parsed = new URL(resolvedUrl);
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return null;
  }

  const response = await fetchWithTimeout(resolvedUrl, {
    accept: 'image/*',
    headers: {
      Accept: 'image/*',
    },
  });

  const contentType = response.headers.get('content-type') || 'application/octet-stream';
  if (!contentType.startsWith('image/')) {
    return null;
  }

  const body = await readResponseWithLimit(response, MAX_ASSET_BYTES);
  const extension = resolveExtension(contentType, resolvedUrl, 'bin');

  return {
    body,
    contentType,
    extension,
  };
}
