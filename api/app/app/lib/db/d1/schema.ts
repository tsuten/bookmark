import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import type { BookmarkMeta } from '../../ports/types'

export const profiles = sqliteTable('profiles', {
  userId: text('user_id').primaryKey(),
  displayName: text('display_name').notNull().default(''),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const bookmarks = sqliteTable(
  'bookmarks',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    title: text('title').notNull().default('untitled'),
    url: text('url').notNull(),
    tags: text('tags', { mode: 'json' }).$type<string[] | null>(),
    note: text('note'),
    meta: text('meta', { mode: 'json' }).$type<BookmarkMeta | null>(),
    isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_bookmarks_user_list').on(table.userId, table.isArchived, table.createdAt),
  ],
)
