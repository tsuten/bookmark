import { boolean, index, jsonb, pgTable, text } from 'drizzle-orm/pg-core'
import type { BookmarkMeta } from '../../ports/types'

export const profiles = pgTable('profiles', {
  userId: text('user_id').primaryKey(),
  displayName: text('display_name').notNull().default(''),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const bookmarks = pgTable(
  'bookmarks',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    title: text('title').notNull().default('untitled'),
    url: text('url').notNull(),
    tags: jsonb('tags').$type<string[] | null>(),
    note: text('note'),
    meta: jsonb('meta').$type<BookmarkMeta | null>(),
    isArchived: boolean('is_archived').notNull().default(false),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_bookmarks_user_list').on(table.userId, table.isArchived, table.createdAt),
  ],
)
