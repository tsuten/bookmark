import { and, asc, count, desc, eq, sql } from 'drizzle-orm'
import type {
  BookmarkListPagination,
  BookmarkListResponse,
  BookmarkListScope,
  BookmarkListSort,
} from './bookmarkItems'
import { serializeBookmarkItem } from './bookmarkItems'
import { getDb } from './db'
import { bookmarks } from './db/schema'
function buildScopeCondition(userId: string, scope: BookmarkListScope) {
  const userMatch = eq(bookmarks.userId, userId)

  switch (scope) {
    case 'active':
      return and(userMatch, eq(bookmarks.isArchived, false))
    case 'archived':
      return and(userMatch, eq(bookmarks.isArchived, true))
    case 'uncategorized':
      return and(
        userMatch,
        eq(bookmarks.isArchived, false),
        sql`(${bookmarks.tags} IS NULL OR json_array_length(${bookmarks.tags}) = 0)`,
      )
    default:
      return and(
        userMatch,
        eq(bookmarks.isArchived, false),
        sql`EXISTS (SELECT 1 FROM json_each(${bookmarks.tags}) WHERE value = ${scope.tag})`,
      )
  }
}

export async function createBookmark(
  db: D1Database,
  userId: string,
  input: {
    title: string
    url: string
    tags?: string[]
    note?: string
    is_archived: boolean
  },
): Promise<void> {
  const drizzle = getDb(db)
  const now = new Date().toISOString()

  await drizzle.insert(bookmarks).values({
    id: crypto.randomUUID(),
    userId,
    title: input.title,
    url: input.url,
    tags: input.tags ?? null,
    note: input.note ?? null,
    isArchived: input.is_archived,
    createdAt: now,
    updatedAt: now,
  })
}

function orderByForSort(sort: BookmarkListSort) {
  switch (sort) {
    case 'oldest':
      return asc(bookmarks.createdAt)
    case 'az':
      return asc(bookmarks.title)
    case 'za':
      return desc(bookmarks.title)
    case 'newest':
    default:
      return desc(bookmarks.createdAt)
  }
}

export async function listBookmarks(
  db: D1Database,
  userId: string,
  scope: BookmarkListScope,
  pagination: BookmarkListPagination,
): Promise<BookmarkListResponse> {
  const drizzle = getDb(db)
  const condition = buildScopeCondition(userId, scope)
  const { page, limit, skip, sort } = pagination

  const [items, totalResult] = await Promise.all([
    drizzle
      .select()
      .from(bookmarks)
      .where(condition)
      .orderBy(orderByForSort(sort))
      .limit(limit)
      .offset(skip),
    drizzle.select({ total: count() }).from(bookmarks).where(condition),
  ])

  const total = totalResult[0]?.total ?? 0

  return {
    items: items.map(serializeBookmarkItem),
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  }
}

export type BookmarkTagSummary = {
  name: string
  count: number
}

export async function listBookmarkTags(
  db: D1Database,
  userId: string,
): Promise<BookmarkTagSummary[]> {
  const drizzle = getDb(db)
  const rows = await drizzle
    .select({ tags: bookmarks.tags })
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.isArchived, false)))

  const counts = new Map<string, number>()
  for (const row of rows) {
    for (const tag of row.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function getBookmark(
  db: D1Database,
  userId: string,
  id: string,
): Promise<(typeof bookmarks.$inferSelect) | null> {
  const drizzle = getDb(db)
  const rows = await drizzle
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.id, id), eq(bookmarks.userId, userId)))
    .limit(1)

  return rows[0] ?? null
}

export async function updateBookmark(
  db: D1Database,
  userId: string,
  id: string,
  input: {
    title?: string
    url?: string
    tags?: string[]
    note?: string | null
  },
): Promise<boolean> {
  const drizzle = getDb(db)
  const updates: {
    title?: string
    url?: string
    tags?: string[] | null
    note?: string | null
    updatedAt: string
  } = {
    updatedAt: new Date().toISOString(),
  }

  if (input.title !== undefined) {
    updates.title = input.title
  }
  if (input.url !== undefined) {
    updates.url = input.url
  }
  if (input.tags !== undefined) {
    updates.tags = input.tags
  }
  if (input.note !== undefined) {
    updates.note = input.note
  }

  const result = await drizzle
    .update(bookmarks)
    .set(updates)
    .where(and(eq(bookmarks.id, id), eq(bookmarks.userId, userId)))

  return (result.meta?.changes ?? 0) > 0
}

export async function archiveBookmark(db: D1Database, userId: string, id: string): Promise<boolean> {
  const drizzle = getDb(db)
  const result = await drizzle
    .update(bookmarks)
    .set({
      isArchived: true,
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(bookmarks.id, id), eq(bookmarks.userId, userId)))

  return (result.meta?.changes ?? 0) > 0
}

export async function restoreBookmark(db: D1Database, userId: string, id: string): Promise<boolean> {
  const drizzle = getDb(db)
  const result = await drizzle
    .update(bookmarks)
    .set({
      isArchived: false,
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(bookmarks.id, id), eq(bookmarks.userId, userId)))

  return (result.meta?.changes ?? 0) > 0
}

export async function deleteBookmark(db: D1Database, userId: string, id: string): Promise<void> {
  const drizzle = getDb(db)
  await drizzle.delete(bookmarks).where(and(eq(bookmarks.id, id), eq(bookmarks.userId, userId)))
}
