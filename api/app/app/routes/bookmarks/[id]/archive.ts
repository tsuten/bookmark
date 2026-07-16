import { createRoute } from 'honox/factory'
import { parseObjectId } from '../../../lib/bookmarkItems'
import { getBookmarkItemModel } from '../../../lib/db/models/BookmarkItem'
import { ApiError } from '../../../lib/errors'
import { handleBookmarkRoute } from '../../../lib/routeHelpers'

export const PATCH = createRoute(async (c) => {
  return handleBookmarkRoute(c, async (userId) => {
    const _id = parseObjectId(c.req.param('id'))
    const BookmarkItemModel = await getBookmarkItemModel()
    const updated = await BookmarkItemModel.updateOne(
      { _id, userId },
      { $set: { is_archived: true, updatedAt: new Date() } },
    )
    if (updated.matchedCount === 0) {
      throw new ApiError('not-found', 'Bookmark not found.', 404)
    }
  })
})
