import { ApiError } from './errors'

export function validateHttpUrlString(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) {
    return { valid: false as const, errorCode: 'required' as const }
  }
  try {
    const parsed = new URL(value.trim())
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false as const, errorCode: 'invalidHttpUrl' as const }
    }
    return { valid: true as const }
  } catch {
    return { valid: false as const, errorCode: 'invalidHttpUrl' as const }
  }
}

export function bookmarkUrlErrorMessage(errorCode: string) {
  switch (errorCode) {
    case 'required':
      return 'Please enter a URL.'
    case 'invalidHttpUrl':
      return 'Please enter a valid http or https URL.'
    default:
      return ''
  }
}

type BookmarkItemInput = {
  title?: unknown
  url?: unknown
  tags?: unknown
  note?: unknown
  is_archived?: unknown
}

type BookmarkItemUpdateInput = {
  title?: unknown
  url?: unknown
  tags?: unknown
}

function trimString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  return value.trim()
}

function normalizeTags(value: unknown): string[] | undefined {
  if (value === undefined) return undefined
  if (!Array.isArray(value) || !value.every((tag) => typeof tag === 'string')) {
    throw new ApiError('invalid-args', 'tags must be an array of strings.')
  }
  return value
}

function assertValidUrl(url: unknown) {
  const result = validateHttpUrlString(url)
  if (result.valid) return trimString(url) as string
  throw new ApiError('invalid-args', bookmarkUrlErrorMessage(result.errorCode))
}

export function parseObjectId(id: unknown): string {
  if (typeof id !== 'string' || !/^[a-f\d]{24}$/i.test(id)) {
    throw new ApiError('invalid-args', 'Bookmark _id must be a valid ObjectId.')
  }
  return id
}

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

export function parseBookmarkListPagination(query: Record<string, string | undefined> = {}) {
  const page = Math.max(DEFAULT_PAGE, Number.parseInt(query.page ?? '', 10) || DEFAULT_PAGE)
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number.parseInt(query.limit ?? '', 10) || DEFAULT_LIMIT),
  )

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  }
}

export function serializeBookmarkItem(doc: {
  _id: { toString(): string }
  title: string
  url: string
  tags?: string[]
  note?: string
  is_archived: boolean
  userId: string
  createdAt: Date
  updatedAt?: Date
}) {
  return {
    _id: doc._id.toString(),
    title: doc.title,
    url: doc.url,
    ...(doc.tags !== undefined ? { tags: doc.tags } : {}),
    ...(doc.note !== undefined ? { note: doc.note } : {}),
    is_archived: doc.is_archived,
    userId: doc.userId,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: (doc.updatedAt ?? doc.createdAt).toISOString(),
  }
}

export function cleanBookmarkItemDoc(doc: BookmarkItemInput = {}, userId: string) {
  const title = trimString(doc.title) || 'untitled'
  const url = assertValidUrl(doc.url)
  const tags = normalizeTags(doc.tags)
  const note = trimString(doc.note)
  const is_archived = typeof doc.is_archived === 'boolean' ? doc.is_archived : false

  return {
    title,
    url,
    ...(tags !== undefined ? { tags } : {}),
    ...(note !== undefined ? { note } : {}),
    is_archived,
    userId,
  }
}

export function cleanBookmarkItemUpdate(doc: BookmarkItemUpdateInput = {}) {
  const cleaned: {
    title?: string
    url?: string
    tags?: string[]
  } = {}

  if (doc.title !== undefined) {
    cleaned.title = trimString(doc.title) || 'untitled'
  }
  if (doc.url !== undefined) {
    cleaned.url = assertValidUrl(doc.url)
  }
  if (doc.tags !== undefined) {
    cleaned.tags = normalizeTags(doc.tags)
  }

  return cleaned
}
