import { swaggerUI } from '@hono/swagger-ui'
import { Scalar } from '@scalar/hono-api-reference'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { inspectRoutes } from 'hono/dev'
import type { MiddlewareHandler } from 'hono'
import type { AppRepos } from './lib/deps'
import * as archived from './routes/bookmarks/archived'
import * as bookmarkId from './routes/bookmarks/[id]'
import * as archiveBookmark from './routes/bookmarks/[id]/archive'
import * as restoreBookmark from './routes/bookmarks/[id]/restore'
import * as bookmarks from './routes/bookmarks/index'
import * as bookmarkTag from './routes/bookmarks/tags/[tag]'
import * as bookmarkTags from './routes/bookmarks/tags/index'
import * as pinTags from './routes/bookmarks/tags/pin'
import * as uncategorized from './routes/bookmarks/uncategorized'
import * as favicon from './routes/favicons/[domain]'
import * as getTitle from './routes/get-title'
import * as profile from './routes/profile/index'
import errorHandler from './routes/_error'
import notFoundHandler from './routes/_404'

export type AppEnv = {
  Variables: {
    repos: AppRepos
  }
  Bindings: {
    DB?: D1Database
    FIREBASE_PROJECT_ID?: string
    BROWSER?: BrowserRun
    FAVICONS?: R2Bucket
    LEAFEE_PINNED_TAGS?: KVNamespace
  }
}

export function createApp(opts: {
  injectRepos: MiddlewareHandler<AppEnv>
  openApiSpec: string
}) {
  const app = new Hono<AppEnv>()

  app.use(
    '*',
    cors({
      origin: (origin) => origin || '*',
      allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Authorization', 'Content-Type'],
    }),
  )
  app.use('*', opts.injectRepos)

  app.get('/', (c) => c.text('yo api server lowkey running'))
  app.get('/routes', (c) => c.text(formatRoutes(app)))

  app.get('/bookmarks', bookmarks.GET)
  app.post('/bookmarks', bookmarks.POST)
  app.get('/bookmarks/archived', archived.GET)
  app.get('/bookmarks/uncategorized', uncategorized.GET)
  app.get('/bookmarks/tags', bookmarkTags.GET)
  app.get('/bookmarks/tags/pin', pinTags.GET)
  app.patch('/bookmarks/tags/pin', pinTags.PATCH)
  app.get('/bookmarks/tags/:tag', bookmarkTag.GET)
  app.patch('/bookmarks/:id', bookmarkId.PATCH)
  app.delete('/bookmarks/:id', bookmarkId.DELETE)
  app.patch('/bookmarks/:id/archive', archiveBookmark.PATCH)
  app.patch('/bookmarks/:id/restore', restoreBookmark.PATCH)

  app.get('/profile', profile.GET)
  app.post('/profile', profile.POST)
  app.patch('/profile', profile.PATCH)
  app.delete('/profile', profile.DELETE)

  app.get('/get-title', getTitle.GET)
  app.get('/favicons/:domain', favicon.GET)

  app.get('/docs/openapi.yaml', (c) =>
    c.text(opts.openApiSpec, 200, { 'Content-Type': 'application/yaml' }),
  )
  app.get(
    '/docs',
    Scalar({
      url: '/docs/openapi.yaml',
      pageTitle: 'Bookmark API',
    }),
  )
  app.get('/swagger', swaggerUI({ url: '/docs/openapi.yaml' }))
  app.get('/redoc', (c) =>
    c.html(`<!DOCTYPE html>
<html>
  <head>
    <title>Bookmark API</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
  </head>
  <body>
    <redoc spec-url="/docs/openapi.yaml"></redoc>
    <script src="https://cdn.redoc.ly/redoc/v2.4.0/bundles/redoc.standalone.js"></script>
  </body>
</html>`),
  )

  app.onError(errorHandler)
  app.notFound(notFoundHandler)

  return app
}

function formatRoutes(app: Hono<AppEnv>): string {
  const routes = inspectRoutes(app).filter(({ isMiddleware }) => !isMiddleware)
  const maxMethodLength = Math.max(0, ...routes.map((r) => r.method.length))
  return routes.map(({ method, path }) => `${method.padEnd(maxMethodLength)} ${path}`).join('\n')
}
