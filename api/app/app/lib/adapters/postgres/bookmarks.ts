import { and, asc, count, desc, eq, sql } from 'drizzle-orm'
import type {
  BookmarkListPagination,
  BookmarkListResponse,
  BookmarkListScope,
  BookmarkListSort,
} from '../../bookmarkItems'
import { serializeBookmarkItem } from '../../bookmarkItems'
import type { PostgresDb } from '../../db/postgres'
import { bookmarks } from '../../db/postgres/schema'
import type {
  BookmarkRepository,
  BookmarkTagSummary,
  CreateBookmarkInput,
  UpdateBookmarkInput,
} from '../../ports/bookmarks'
import type { BookmarkRecord } from '../../ports/types'

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
        sql`(${bookmarks.tags} IS NULL OR jsonb_array_length(${bookmarks.tags}) = 0)`,
      )
    default:
      return and(
        userMatch,
        eq(bookmarks.isArchived, false),
        sql`${bookmarks.tags} @> jsonb_build_array(${scope.tag})`,
      )
  }
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

function affected(result: { rowCount?: number | null }): boolean {
  return (result.rowCount ?? 0) > 0
}

export function createPostgresBookmarkRepository(db: PostgresDb): BookmarkRepository {
  return {
    async create(userId: string, input: CreateBookmarkInput): Promise<void> {
      const now = new Date().toISOString()
      await db.insert(bookmarks).values({
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
    },

    async list(
      userId: string,
      scope: BookmarkListScope,
      pagination: BookmarkListPagination,
    ): Promise<BookmarkListResponse> {
      const condition = buildScopeCondition(userId, scope)
      const { page, limit, skip, sort } = pagination

      const [items, totalResult] = await Promise.all([
        db
          .select()
          .from(bookmarks)
          .where(condition)
          .orderBy(orderByForSort(sort))
          .limit(limit)
          .offset(skip),
        db.select({ total: count() }).from(bookmarks).where(condition),
      ])

      const total = totalResult[0]?.total ?? 0

      return {
        items: items.map(serializeBookmarkItem),
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      }
    },

    async listTags(userId: string): Promise<BookmarkTagSummary[]> {
      const rows = await db
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
    },

    async get(userId: string, id: string): Promise<BookmarkRecord | null> {
      const rows = await db
        .select()
        .from(bookmarks)
        .where(and(eq(bookmarks.id, id), eq(bookmarks.userId, userId)))
        .limit(1)

      return rows[0] ?? null
    },

    async update(userId: string, id: string, input: UpdateBookmarkInput): Promise<boolean> {
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

      const result = await db
        .update(bookmarks)
        .set(updates)
        .where(and(eq(bookmarks.id, id), eq(bookmarks.userId, userId)))

      return affected(result)
    },

    async archive(userId: string, id: string): Promise<boolean> {
      const result = await db
        .update(bookmarks)
        .set({
          isArchived: true,
          updatedAt: new Date().toISOString(),
        })
        .where(and(eq(bookmarks.id, id), eq(bookmarks.userId, userId)))

      return affected(result)
    },

    async restore(userId: string, id: string): Promise<boolean> {
      const result = await db
        .update(bookmarks)
        .set({
          isArchived: false,
          updatedAt: new Date().toISOString(),
        })
        .where(and(eq(bookmarks.id, id), eq(bookmarks.userId, userId)))

      return affected(result)
    },

    async delete(userId: string, id: string): Promise<void> {
      await db.delete(bookmarks).where(and(eq(bookmarks.id, id), eq(bookmarks.userId, userId)))
    },
  }
}

