import { Scalar } from '@scalar/hono-api-reference'
import { createRoute } from 'honox/factory'

export const GET = createRoute(
  Scalar({
    url: '/docs/openapi.yaml',
    pageTitle: 'Bookmark API',
  }),
)
