export type BookmarkMeta = Record<string, unknown>

export type BookmarkRecord = {
  id: string
  userId: string
  title: string
  url: string
  tags: string[] | null
  note: string | null
  meta: BookmarkMeta | null
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export type ProfileRecord = {
  userId: string
  displayName: string
  createdAt: string
  updatedAt: string
}
