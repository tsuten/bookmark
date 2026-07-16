import { createRoute } from 'honox/factory'
import { insertBookmarkItem, listBookmarkItems, parseBookmarkListPagination } from '../../lib/bookmarkItems'
import { handleBookmarkJsonRoute, handleBookmarkRoute } from '../../lib/routeHelpers'

export const GET = createRoute(async (c) => {
  return handleBookmarkJsonRoute(c, async (userId) => {
    const pagination = parseBookmarkListPagination(c.req.query())
    return listBookmarkItems(userId, pagination)
  })
})

export const POST = createRoute(async (c) => {
  return handleBookmarkRoute(c, async (userId, body) => {
    await insertBookmarkItem(body as Record<string, unknown>, userId)
  })
})
