import { createRoute } from 'honox/factory'
import { restoreBookmark } from '../../../lib/bookmarks'
import { parseUuid } from '../../../lib/bookmarkItems'
import { ApiError } from '../../../lib/errors'
import { handleBookmarkRoute } from '../../../lib/routeHelpers'

export const PATCH = createRoute(async (c) => {
  return handleBookmarkRoute(c, async (userId) => {
    const id = parseUuid(c.req.param('id'))
    const updated = await restoreBookmark(c.env.DB, userId, id)
    if (!updated) {
      throw new ApiError('not-found', 'Bookmark not found.', 404)
    }
  })
})
