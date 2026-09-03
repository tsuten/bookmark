import type { Context } from 'hono'
import { getRepos } from '../../../lib/deps'
import { parseBookmarkListPagination } from '../../../lib/bookmarkItems'
import { handleBookmarkJsonRoute } from '../../../lib/routeHelpers'

export const GET = async (c: Context) => {
  return handleBookmarkJsonRoute(c, async (userId) => {
    const tag = decodeURIComponent(c.req.param('tag') ?? '')
    const pagination = parseBookmarkListPagination(c.req.query())
    return getRepos(c).bookmarks.list(userId, { tag }, pagination)
  })
}
