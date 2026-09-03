import type {
  BookmarkListPagination,
  BookmarkListResponse,
  BookmarkListScope,
} from '../bookmarkItems'
import type { BookmarkRecord } from './types'

export type BookmarkTagSummary = {
  name: string
  count: number
}

export type CreateBookmarkInput = {
  title: string
  url: string
  tags?: string[]
  note?: string
  is_archived: boolean
}

export type UpdateBookmarkInput = {
  title?: string
  url?: string
  tags?: string[]
  note?: string | null
}

export type BookmarkRepository = {
  create(userId: string, input: CreateBookmarkInput): Promise<void>
  list(
    userId: string,
    scope: BookmarkListScope,
    pagination: BookmarkListPagination,
  ): Promise<BookmarkListResponse>
  listTags(userId: string): Promise<BookmarkTagSummary[]>
  get(userId: string, id: string): Promise<BookmarkRecord | null>
  update(userId: string, id: string, input: UpdateBookmarkInput): Promise<boolean>
  archive(userId: string, id: string): Promise<boolean>
  restore(userId: string, id: string): Promise<boolean>
  delete(userId: string, id: string): Promise<void>
}
