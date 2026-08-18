import { createRoute } from 'honox/factory'
import { listBookmarkTags } from '../../../lib/bookmarks'
import { getPinnedTags } from '../../../lib/pinnedTags'
import { handleBookmarkJsonRoute } from '../../../lib/routeHelpers'

export const GET = createRoute(async (c) => {
  return handleBookmarkJsonRoute(c, async (userId) => {
    const [tags, pinned_tags] = await Promise.all([
      listBookmarkTags(c.env.DB, userId),
      getPinnedTags(c.env.LEAFEE_PINNED_TAGS, userId),
    ])
    return { tags, pinned_tags }
  })
})
