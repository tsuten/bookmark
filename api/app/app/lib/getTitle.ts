import { ApiError } from './errors'

const FETCH_TIMEOUT_MS = 10_000
const MAX_HTML_BYTES = 256_000
const USER_AGENT = 'Mozilla/5.0 (compatible; BookmarkBot/1.0)'

const OG_TITLE_META =
  /<meta[^>]+(?:property|name)=["']og:title["'][^>]+content=["']([^"']*)["'][^>]*>|<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']og:title["'][^>]*>/i
const TITLE_TAG = /<title[^>]*>([\s\S]*?)<\/title>/i

function logGetTitle(message: string, details?: Record<string, unknown>) {
  if (details) {
    console.log(`[get-title] ${message}`, details)
    return
  }
  console.log(`[get-title] ${message}`)
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
}

export function extractTitleFromHtml(html: string): string | null {
  const ogMatch = html.match(OG_TITLE_META)
  const ogTitle = (ogMatch?.[1] ?? ogMatch?.[2] ?? '').trim()
  if (ogTitle) {
    return decodeHtmlEntities(ogTitle)
  }

  const titleMatch = html.match(TITLE_TAG)
  const pageTitle = titleMatch?.[1]?.replace(/\s+/g, ' ').trim() ?? ''
  if (pageTitle) {
    return decodeHtmlEntities(pageTitle)
  }

  return null
}

function looksLikeBotChallenge(html: string): boolean {
  return (
    html.includes('awsWaf') ||
    html.includes('challenge-container') ||
    html.includes('cf-challenge') ||
    html.includes('captcha')
  )
}

async function fetchUrlResponse(url: string): Promise<Response> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: 'follow',
    })
    if (!response.ok) {
      throw new ApiError(
        'fetch-failed',
        `Failed to fetch URL (${response.status}).`,
        502,
      )
    }
    return response
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError('fetch-failed', 'Failed to fetch URL.', 502)
  }
}

async function fetchTitleWithRewriter(url: string): Promise<string | null> {
  const response = await fetchUrlResponse(url)
  const status = response.status

  if (typeof HTMLRewriter === 'undefined') {
    const html = (await response.text()).slice(0, MAX_HTML_BYTES)
    const title = extractTitleFromHtml(html)
    logGetTitle('tier1 regex result', {
      url,
      status,
      htmlLength: html.length,
      title,
      botChallenge: looksLikeBotChallenge(html),
      htmlSnippet: html.slice(0, 300),
    })
    return title
  }

  let ogTitle: string | null = null
  let pageTitle = ''

  const transformed = new HTMLRewriter()
    .on('meta[property="og:title"], meta[name="og:title"]', {
      element(element) {
        if (ogTitle) {
          return
        }
        const content = element.getAttribute('content')?.trim()
        if (content) {
          ogTitle = decodeHtmlEntities(content)
        }
      },
    })
    .on('title', {
      text(text) {
        if (text.removed) {
          return
        }
        pageTitle += text.text
      },
    })
    .transform(response)

  const html = (await transformed.text()).slice(0, MAX_HTML_BYTES)
  const normalizedTitle = pageTitle.replace(/\s+/g, ' ').trim()
  const title = ogTitle ?? (normalizedTitle ? decodeHtmlEntities(normalizedTitle) : null)

  logGetTitle('tier1 HTMLRewriter result', {
    url,
    status,
    htmlLength: html.length,
    ogTitle,
    pageTitle: normalizedTitle || null,
    title,
    botChallenge: looksLikeBotChallenge(html),
    htmlSnippet: html.slice(0, 300),
  })

  return title
}

type BrowserContentResponse =
  | BrowserRunContentSuccessResponse
  | BrowserRunErrorResponse

async function fetchTitleWithBrowser(
  browser: BrowserRun,
  url: string,
): Promise<string | null> {
  logGetTitle('tier2 browser start', { url })

  const response = await browser.quickAction('content', {
    url,
    gotoOptions: { waitUntil: 'networkidle2' },
    rejectResourceTypes: ['image', 'font', 'media'],
  })

  if (!response.ok) {
    logGetTitle('tier2 browser HTTP error', {
      url,
      status: response.status,
    })
    throw new ApiError(
      'fetch-failed',
      `Failed to fetch URL with browser (${response.status}).`,
      502,
    )
  }

  const data = (await response.json()) as BrowserContentResponse
  if (!data.success) {
    logGetTitle('tier2 browser action failed', {
      url,
      errors: data.errors,
    })
    const message = data.errors[0]?.message ?? 'Browser fetch failed.'
    throw new ApiError('fetch-failed', message, 502)
  }

  const html = data.result.slice(0, MAX_HTML_BYTES)
  const htmlTitle = extractTitleFromHtml(html)
  const metaTitle = data.meta.title.trim()
  const title = htmlTitle ?? (metaTitle ? decodeHtmlEntities(metaTitle) : null)

  logGetTitle('tier2 browser result', {
    url,
    responseStatus: response.status,
    pageStatus: data.meta.status,
    metaTitle: metaTitle || null,
    htmlLength: html.length,
    htmlTitle,
    title,
    botChallenge: looksLikeBotChallenge(html),
    htmlSnippet: html.slice(0, 300),
  })

  return title
}

export async function fetchPageTitle(
  url: string,
  browser?: BrowserRun,
): Promise<string | null> {
  logGetTitle('start', { url, browserAvailable: Boolean(browser) })

  const title = await fetchTitleWithRewriter(url)
  if (title) {
    logGetTitle('done', { url, title, source: 'tier1' })
    return title
  }

  if (!browser) {
    logGetTitle('done', {
      url,
      title: null,
      source: 'tier1-only',
      reason: 'browser binding unavailable',
    })
    return null
  }

  const browserTitle = await fetchTitleWithBrowser(browser, url)
  logGetTitle('done', {
    url,
    title: browserTitle,
    source: browserTitle ? 'tier2' : 'none',
  })
  return browserTitle
}
