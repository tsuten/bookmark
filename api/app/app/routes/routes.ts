import { createRoute } from 'honox/factory'
import { showRoutes } from 'hono/dev'
import app from '../server'

export const GET = createRoute(async (c) => {
  return c.text(showRoutes(app))
})