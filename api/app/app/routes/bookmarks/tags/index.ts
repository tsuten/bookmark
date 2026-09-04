import type { Context } from 'hono'
import { getKvStore, getRepos } from '../../../lib/deps'
import { getPinnedTags } from '../../../lib/pinnedTags'
import { handleBookmarkJsonRoute } from '../../../lib/routeHelpers'

export const GET = async (c: Context) => {
  return handleBookmarkJsonRoute(c, async (userId) => {
    const [tags, pinned_tags] = await Promise.all([
      getRepos(c).bookmarks.listTags(userId),
      getPinnedTags(getKvStore(c), userId),
    ])
    return { tags, pinned_tags }
  })
}
