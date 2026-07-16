import { createRoute } from 'honox/factory'
import { archiveBookmarkItem } from '../../../lib/bookmarkItems'
import { handleBookmarkRoute } from '../../../lib/routeHelpers'

export const PATCH = createRoute(async (c) => {
  return handleBookmarkRoute(c, async (userId) => {
    await archiveBookmarkItem({ _id: c.req.param('id') }, userId)
  })
})
