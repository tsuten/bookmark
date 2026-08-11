import { swaggerUI } from '@hono/swagger-ui'
import { createRoute } from 'honox/factory'

export const GET = createRoute(
  swaggerUI({ url: '/docs/openapi.yaml' }),
)
