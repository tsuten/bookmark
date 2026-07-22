import { createRoute } from 'honox/factory'
import { archiveBookmark, deleteBookmark, updateBookmark } from '../../lib/bookmarks'
import { cleanBookmarkItemUpdate, parseUuid } from '../../lib/bookmarkItems'
import { ApiError } from '../../lib/errors'
import { handleBookmarkRoute } from '../../lib/routeHelpers'

export const PATCH = createRoute(async (c) => {
  return handleBookmarkRoute(c, async (userId, body) => {
    const { title, url, tags, note } = body as {
      title?: unknown
      url?: unknown
      tags?: unknown
      note?: unknown
    }
    const id = parseUuid(c.req.param('id'))
    const cleaned = cleanBookmarkItemUpdate({ title, url, tags, note })
    const updated = await updateBookmark(c.env.DB, userId, id, cleaned)
    if (!updated) {
      throw new ApiError('not-found', 'Bookmark not found.', 404)
    }
  })
})

export const DELETE = createRoute(async (c) => {
  return handleBookmarkRoute(c, async (userId) => {
    const id = parseUuid(c.req.param('id'))
    await deleteBookmark(c.env.DB, userId, id)
  })
})
