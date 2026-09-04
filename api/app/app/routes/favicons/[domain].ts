import type { Context } from 'hono'
import { getObjectStore } from '../../lib/deps'
import { ensureDomainFavicon, isValidDomainParam } from '../../lib/favicons'

export const GET = async (c: Context) => {
  const domain = c.req.param('domain')
  if (!domain || !isValidDomainParam(domain)) {
    return c.notFound()
  }

  const favicon = await ensureDomainFavicon(getObjectStore(c), domain)
  if (!favicon) {
    return c.notFound()
  }

  return new Response(favicon.bytes, {
    headers: {
      'content-type': favicon.contentType,
      'cache-control': 'public, max-age=86400',
    },
  })
}
