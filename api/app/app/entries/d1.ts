import { createApp } from '../createApp'
import { createR2ObjectStore } from '../lib/adapters/r2/objects'
import { createD1Repositories } from '../lib/deps/d1'

import openApiSpec from '../../docs/openapi.yaml'

const app = createApp({
  injectRepos: async (c, next) => {
    const db = c.env.DB
    if (!db) {
      return c.json({ error: 'not-configured', message: 'D1 database is not configured.' }, 503)
    }
    c.set('repos', createD1Repositories(db))
    if (c.env.FAVICONS) {
      c.set('objects', createR2ObjectStore(c.env.FAVICONS))
    }
    await next()
  },
  openApiSpec,
})

export default app
