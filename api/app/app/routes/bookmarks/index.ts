import { createRoute } from 'honox/factory'
import {
  cleanBookmarkItemDoc,
  parseBookmarkListPagination,
  serializeBookmarkItem,
} from '../../lib/bookmarkItems'
import { getBookmarkItemModel } from '../../lib/db/models/BookmarkItem'
import { handleBookmarkJsonRoute, handleBookmarkRoute } from '../../lib/routeHelpers'

export const GET = createRoute(async (c) => {
  return handleBookmarkJsonRoute(c, async (userId) => {
    const BookmarkItemModel = await getBookmarkItemModel()
    const { page, limit, skip } = parseBookmarkListPagination(c.req.query())
    const filter = { userId }

    const [items, total] = await Promise.all([
      BookmarkItemModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BookmarkItemModel.countDocuments(filter),
    ])

    return {
      items: items.map(serializeBookmarkItem),
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    }
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
