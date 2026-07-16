import type { Model } from 'mongoose'

type BookmarkItemDoc = {
  title: string
  url: string
  tags?: string[]
  note?: string
  is_archived: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
}

let bookmarkItemModel: Model<BookmarkItemDoc> | null = null

export async function getBookmarkItemModel() {
  if (bookmarkItemModel) {
    return bookmarkItemModel
  }

  const { default: mongoose } = await import('mongoose')
  const schema = new mongoose.Schema<BookmarkItemDoc>(
    {
      title: { type: String, default: 'untitled', trim: true },
      url: { type: String, required: true, trim: true },
      tags: { type: [String], default: undefined },
      note: { type: String, trim: true },
      is_archived: { type: Boolean, default: false },
      userId: { type: String, required: true },
      createdAt: { type: Date, required: true },
      updatedAt: { type: Date, required: true },
    },
    {
      collection: 'bookmarkItems',
    },
  )

  bookmarkItemModel =
    (mongoose.models.BookmarkItem as Model<BookmarkItemDoc> | undefined) ??
    mongoose.model<BookmarkItemDoc>('BookmarkItem', schema)

  return bookmarkItemModel
}
