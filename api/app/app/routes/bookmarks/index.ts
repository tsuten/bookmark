import type { Context } from 'hono'
import { getRepos } from '../../lib/deps'
import {
  cleanBookmarkItemDoc,
  parseBookmarkListPagination,
} from '../../lib/bookmarkItems'
import { handleBookmarkJsonRoute, handleBookmarkRoute } from '../../lib/routeHelpers'

export const GET = async (c: Context) => {
  return handleBookmarkJsonRoute(c, async (userId) => {
    const pagination = parseBookmarkListPagination(c.req.query())
    return getRepos(c).bookmarks.list(userId, 'active', pagination)
  })
}

export const POST = async (c: Context) => {
  return handleBookmarkRoute(c, async (userId, body) => {
    const cleaned = cleanBookmarkItemDoc(body as Record<string, unknown>, userId)
    await getRepos(c).bookmarks.create(userId, cleaned)
  })
}
