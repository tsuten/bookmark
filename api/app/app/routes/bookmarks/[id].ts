import { createRoute } from 'honox/factory'
import { cleanBookmarkItemUpdate, parseObjectId } from '../../lib/bookmarkItems'
import { getBookmarkItemModel } from '../../lib/db/models/BookmarkItem'
import { ApiError } from '../../lib/errors'
import { handleBookmarkRoute } from '../../lib/routeHelpers'

export const PATCH = createRoute(async (c) => {
  return handleBookmarkRoute(c, async (userId, body) => {
    const { title, url, tags } = body as {
      title?: unknown
      url?: unknown
      tags?: unknown
    }
    const _id = parseObjectId(c.req.param('id'))
    const cleaned = cleanBookmarkItemUpdate({ title, url, tags })
    const BookmarkItemModel = await getBookmarkItemModel()
    const updated = await BookmarkItemModel.updateOne(
      { _id, userId },
      { $set: { ...cleaned, updatedAt: new Date() } },
    )
    if (updated.matchedCount === 0) {
      throw new ApiError('not-found', 'Bookmark not found.', 404)
    }
  })
})

export const DELETE = createRoute(async (c) => {
  return handleBookmarkRoute(c, async (userId) => {
    const _id = parseObjectId(c.req.param('id'))
    const BookmarkItemModel = await getBookmarkItemModel()
    // Filtering by userId ensures users can only delete their own bookmarks.
    await BookmarkItemModel.deleteOne({ _id, userId })
  })
})
