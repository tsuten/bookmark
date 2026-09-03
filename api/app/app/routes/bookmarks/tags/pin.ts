import type { Context } from 'hono'
import { requirePinnedTagsKv } from '../../../lib/bindings'
import { getPinnedTags, parsePinnedTagsBody, putPinnedTags } from '../../../lib/pinnedTags'
import { handleBookmarkJsonRoute, handleProfileJsonRoute } from '../../../lib/routeHelpers'

export const GET = async (c: Context) => {
  return handleBookmarkJsonRoute(c, async (userId) => {
    const pinned_tags = await getPinnedTags(requirePinnedTagsKv(c), userId)
    return { pinned_tags }
  })
}

export const PATCH = async (c: Context) => {
  return handleProfileJsonRoute(c, async (userId, body) => {
    const pinned_tags = parsePinnedTagsBody(body)
    return putPinnedTags(requirePinnedTagsKv(c), userId, pinned_tags)
  })
}
