import { createRoute } from 'honox/factory'
import { listBookmarks, parseBookmarkListPagination } from '../../../lib/bookmarkItems'
import { handleBookmarkJsonRoute } from '../../../lib/routeHelpers'

export const GET = createRoute(async (c) => {
  return handleBookmarkJsonRoute(c, async (userId) => {
    const tag = decodeURIComponent(c.req.param('tag'))
    const pagination = parseBookmarkListPagination(c.req.query())
    return listBookmarks(userId, { tag }, pagination)
  })
})
