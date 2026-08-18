import { createRoute } from 'honox/factory'
import { getPinnedTags, parsePinnedTagsBody, putPinnedTags } from '../../../lib/pinnedTags'
import { handleBookmarkJsonRoute, handleProfileJsonRoute } from '../../../lib/routeHelpers'

export const GET = createRoute(async (c) => {
  return handleBookmarkJsonRoute(c, async (userId) => {
    const pinned_tags = await getPinnedTags(c.env.LEAFEE_PINNED_TAGS, userId)
    return { pinned_tags }
  })
})

export const PATCH = createRoute(async (c) => {
  return handleProfileJsonRoute(c, async (userId, body) => {
    const pinned_tags = parsePinnedTagsBody(body)
    return putPinnedTags(c.env.LEAFEE_PINNED_TAGS, userId, pinned_tags)
  })
})
