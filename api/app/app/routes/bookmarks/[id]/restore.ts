import type { Context } from 'hono'
import { getRepos } from '../../../lib/deps'
import { parseUuid } from '../../../lib/bookmarkItems'
import { ApiError } from '../../../lib/errors'
import { handleBookmarkRoute } from '../../../lib/routeHelpers'

export const PATCH = async (c: Context) => {
  return handleBookmarkRoute(c, async (userId) => {
    const id = parseUuid(c.req.param('id'))
    const updated = await getRepos(c).bookmarks.restore(userId, id)
    if (!updated) {
      throw new ApiError('not-found', 'Bookmark not found.', 404)
    }
  })
}
