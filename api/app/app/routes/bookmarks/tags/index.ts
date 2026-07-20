import { createRoute } from 'honox/factory'
import { listBookmarkTags } from '../../../lib/bookmarkItems'
import { handleBookmarkJsonRoute } from '../../../lib/routeHelpers'

export const GET = createRoute(async (c) => {
  return handleBookmarkJsonRoute(c, async (userId) => {
    const tags = await listBookmarkTags(userId)
    return { tags }
  })
})
