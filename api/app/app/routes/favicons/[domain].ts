import { createRoute } from 'honox/factory'
import { ensureDomainFavicon, isValidDomainParam } from '../../lib/favicons'

export const GET = createRoute(async (c) => {
  const domain = c.req.param('domain')
  if (!domain || !isValidDomainParam(domain)) {
    return c.notFound()
  }

  const favicon = await ensureDomainFavicon(c.env.FAVICONS, domain)
  if (!favicon) {
    return c.notFound()
  }

  return new Response(favicon.bytes, {
    headers: {
      'content-type': favicon.contentType,
      'cache-control': 'public, max-age=86400',
    },
  })
})
