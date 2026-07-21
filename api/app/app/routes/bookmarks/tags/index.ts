import { createRoute } from 'honox/factory'
import { listBookmarkTags } from '../../../lib/bookmarks'
import { handleBookmarkJsonRoute } from '../../../lib/routeHelpers'

export const GET = createRoute(async (c) => {
  return handleBookmarkJsonRoute(c, async (userId) => {
    const tags = await listBookmarkTags(c.env.DB, userId)
    return { tags }
  })
})
