import type { Context } from 'hono'
import { bookmarkUrlErrorMessage, validateHttpUrlString } from '../lib/bookmarkItems'
import { ApiError } from '../lib/errors'
import { fetchPageTitle } from '../lib/getTitle'
import { handleBookmarkJsonRoute } from '../lib/routeHelpers'

export const GET = async (c: Context) => {
  return handleBookmarkJsonRoute(c, async () => {
    const url = c.req.query('url')
    if (!url) {
      throw new ApiError('invalid-args', 'Missing url parameter.')
    }

    const result = validateHttpUrlString(url)
    if (!result.valid) {
      throw new ApiError('invalid-args', bookmarkUrlErrorMessage(result.errorCode))
    }

    const title = await fetchPageTitle(url.trim(), c.env.BROWSER)
    return { title }
  })
}
