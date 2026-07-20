import { showRoutes } from 'hono/dev'
import { cors } from 'hono/cors'
import { createApp } from 'honox/server'

const app = createApp({
  init(app) {
    app.use(
      '*',
      cors({
        origin: '*',
        allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Authorization', 'Content-Type'],
      }),
    )
  },
})

showRoutes(app)

export default app
