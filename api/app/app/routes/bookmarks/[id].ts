import type { Context } from 'hono'
import { getRepos } from '../../lib/deps'
import { cleanBookmarkItemUpdate, parseUuid } from '../../lib/bookmarkItems'
import { ApiError } from '../../lib/errors'
import { handleBookmarkRoute } from '../../lib/routeHelpers'

export const PATCH = async (c: Context) => {
  return handleBookmarkRoute(c, async (userId, body) => {
    const { title, url, tags, note } = body as {
      title?: unknown
      url?: unknown
      tags?: unknown
      note?: unknown
    }
    const id = parseUuid(c.req.param('id'))
    const cleaned = cleanBookmarkItemUpdate({ title, url, tags, note })
    const updated = await getRepos(c).bookmarks.update(userId, id, cleaned)
    if (!updated) {
      throw new ApiError('not-found', 'Bookmark not found.', 404)
    }
  })
}

export const DELETE = async (c: Context) => {
  return handleBookmarkRoute(c, async (userId) => {
    const id = parseUuid(c.req.param('id'))
    await getRepos(c).bookmarks.delete(userId, id)
  })
}
