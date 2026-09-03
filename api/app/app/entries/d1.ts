import { createApp } from '../createApp'
import { createD1Repositories } from '../lib/deps/d1'

import openApiSpec from '../../docs/openapi.yaml'

const app = createApp({
  injectRepos: async (c, next) => {
    const db = c.env.DB
    if (!db) {
      return c.json({ error: 'not-configured', message: 'D1 database is not configured.' }, 503)
    }
    c.set('repos', createD1Repositories(db))
    await next()
  },
  openApiSpec,
})

export default app
