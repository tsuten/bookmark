import { createRoute } from 'honox/factory'
import { listBookmarks } from '../../lib/bookmarks'
import { parseBookmarkListPagination } from '../../lib/bookmarkItems'
import { handleBookmarkJsonRoute } from '../../lib/routeHelpers'

export const GET = createRoute(async (c) => {
  return handleBookmarkJsonRoute(c, async (userId) => {
    const pagination = parseBookmarkListPagination(c.req.query())
    return listBookmarks(c.env.DB, userId, 'archived', pagination)
  })
})
