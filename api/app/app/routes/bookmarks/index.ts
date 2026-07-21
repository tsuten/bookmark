import { createRoute } from 'honox/factory'
import { createBookmark, listBookmarks } from '../../lib/bookmarks'
import {
  cleanBookmarkItemDoc,
  parseBookmarkListPagination,
} from '../../lib/bookmarkItems'
import { handleBookmarkJsonRoute, handleBookmarkRoute } from '../../lib/routeHelpers'

export const GET = createRoute(async (c) => {
  return handleBookmarkJsonRoute(c, async (userId) => {
    const pagination = parseBookmarkListPagination(c.req.query())
    return listBookmarks(c.env.DB, userId, 'active', pagination)
  })
})

export const POST = createRoute(async (c) => {
  return handleBookmarkRoute(c, async (userId, body) => {
    const cleaned = cleanBookmarkItemDoc(body as Record<string, unknown>, userId)
    await createBookmark(c.env.DB, userId, cleaned)
  })
})
