import { createRoute } from 'honox/factory'
import {
  cleanBookmarkItemDoc,
  listBookmarks,
  parseBookmarkListPagination,
} from '../../lib/bookmarkItems'
import { getBookmarkItemModel } from '../../lib/db/models/BookmarkItem'
import { handleBookmarkJsonRoute, handleBookmarkRoute } from '../../lib/routeHelpers'

export const GET = createRoute(async (c) => {
  return handleBookmarkJsonRoute(c, async (userId) => {
    const pagination = parseBookmarkListPagination(c.req.query())
    return listBookmarks(userId, 'active', pagination)
  })
})

export const POST = createRoute(async (c) => {
  return handleBookmarkRoute(c, async (userId, body) => {
    const cleaned = cleanBookmarkItemDoc(body as Record<string, unknown>, userId)
    const BookmarkItemModel = await getBookmarkItemModel()
    const now = new Date()
    await BookmarkItemModel.create({
      ...cleaned,
      createdAt: now,
      updatedAt: now,
    })
  })
})
