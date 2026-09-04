import type { ObjectStore } from './ports/objects'

export const GOOGLE_FAVICON_ENDPOINT = 'https://www.google.com/s2/favicons'
export const DUCKDUCKGO_FAVICON_ENDPOINT = 'https://icons.duckduckgo.com/ip3'

export const FAVICON_SIZES = [128, 64, 32, 16] as const

const DOMAIN_PARAM_RE = /^[a-zA-Z0-9.-]+$/

export function extractDomain(url: string): string {
  return new URL(url).hostname
}

export function isValidDomainParam(domain: string): boolean {
  return domain.length > 0 && domain.length <= 253 && DOMAIN_PARAM_RE.test(domain)
}

export function buildFaviconObjectKey(domain: string): string {
  return `favicons/${domain}`
}

export function googleFaviconUrl(domain: string, size: number): string {
  return `${GOOGLE_FAVICON_ENDPOINT}?domain=${encodeURIComponent(domain)}&sz=${size}`
}

export function duckDuckGoFaviconUrl(domain: string): string {
  return `${DUCKDUCKGO_FAVICON_ENDPOINT}/${encodeURIComponent(domain)}.ico`
}

export function readPngDimensions(bytes: ArrayBuffer): { width: number; height: number } | null {
  if (bytes.byteLength < 24) return null

  const view = new DataView(bytes)
  const isPng =
    view.getUint8(0) === 0x89 &&
    view.getUint8(1) === 0x50 &&
    view.getUint8(2) === 0x4e &&
    view.getUint8(3) === 0x47

  if (!isPng) return null

  return {
    width: view.getUint32(16),
    height: view.getUint32(20),
  }
}

export function imagePixelCount(bytes: ArrayBuffer): number {
  const dimensions = readPngDimensions(bytes)
  if (!dimensions) return bytes.byteLength
  return dimensions.width * dimensions.height
}

export async function fetchLargestGoogleFavicon(
  domain: string,
): Promise<{ bytes: ArrayBuffer; contentType: string }> {
  let best: { bytes: ArrayBuffer; contentType: string; pixels: number } | null = null

  for (const size of FAVICON_SIZES) {
    const response = await fetch(googleFaviconUrl(domain, size))
    if (!response.ok) continue

    const bytes = await response.arrayBuffer()
    if (bytes.byteLength === 0) continue

    const pixels = imagePixelCount(bytes)
    const contentType = response.headers.get('content-type') ?? 'image/png'
    const dimensions = readPngDimensions(bytes)

    if (!best || pixels > best.pixels) {
      best = { bytes, contentType, pixels }
    }

    if (dimensions && dimensions.width >= size && dimensions.height >= size) {
      break
    }
  }

  if (!best) {
    throw new Error('Failed to fetch favicon from Google.')
  }

  return { bytes: best.bytes, contentType: best.contentType }
}

export async function fetchDuckDuckGoFavicon(
  domain: string,
): Promise<{ bytes: ArrayBuffer; contentType: string }> {
  const response = await fetch(duckDuckGoFaviconUrl(domain))
  if (!response.ok) {
    throw new Error('Failed to fetch favicon from DuckDuckGo.')
  }

  const bytes = await response.arrayBuffer()
  if (bytes.byteLength === 0) {
    throw new Error('DuckDuckGo favicon is empty.')
  }

  return {
    bytes,
    contentType: response.headers.get('content-type') ?? 'image/x-icon',
  }
}

export async function fetchFaviconWithFallback(
  domain: string,
): Promise<{ bytes: ArrayBuffer; contentType: string }> {
  try {
    return await fetchLargestGoogleFavicon(domain)
  } catch {
    return fetchDuckDuckGoFavicon(domain)
  }
}

export async function ensureDomainFavicon(
  store: ObjectStore,
  domain: string,
): Promise<{ bytes: ArrayBuffer; contentType: string } | null> {
  const objectKey = buildFaviconObjectKey(domain)
  const existing = await store.get(objectKey)
  if (existing) {
    return existing
  }

  let favicon: { bytes: ArrayBuffer; contentType: string }
  try {
    favicon = await fetchFaviconWithFallback(domain)
  } catch {
    return null
  }

  await store.put(objectKey, favicon.bytes, favicon.contentType)
  return favicon
}
