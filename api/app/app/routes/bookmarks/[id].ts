import { createRoute } from 'honox/factory'
import { deleteBookmarkItem, updateBookmarkItem } from '../../lib/bookmarkItems'
import { handleBookmarkRoute } from '../../lib/routeHelpers'

export const PATCH = createRoute(async (c) => {
  return handleBookmarkRoute(c, async (userId, body) => {
    const { title, url, tags } = body as {
      title?: unknown
      url?: unknown
      tags?: unknown
    }
    await updateBookmarkItem({ _id: c.req.param('id'), title, url, tags }, userId)
  })
})

export const DELETE = createRoute(async (c) => {
  return handleBookmarkRoute(c, async (userId) => {
    await deleteBookmarkItem({ _id: c.req.param('id') }, userId)
  })
})
