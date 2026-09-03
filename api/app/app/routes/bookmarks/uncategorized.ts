import type { Context } from 'hono'
import { getRepos } from '../../lib/deps'
import { parseBookmarkListPagination } from '../../lib/bookmarkItems'
import { handleBookmarkJsonRoute } from '../../lib/routeHelpers'

export const GET = async (c: Context) => {
  return handleBookmarkJsonRoute(c, async (userId) => {
    const pagination = parseBookmarkListPagination(c.req.query())
    return getRepos(c).bookmarks.list(userId, 'uncategorized', pagination)
  })
}
