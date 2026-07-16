import { createRoute } from 'honox/factory'
import { inspectRoutes } from 'hono/dev'
import app from '../server'

function formatRoutes(): string {
  const routes = inspectRoutes(app).filter(({ isMiddleware }) => !isMiddleware)
  const maxMethodLength = Math.max(0, ...routes.map((r) => r.method.length))

  return routes
    .map(({ method, path }) => `${method.padEnd(maxMethodLength)} ${path}`)
    .join('\n')
}

export const GET = createRoute(async (c) => {
  return c.text(formatRoutes())
})