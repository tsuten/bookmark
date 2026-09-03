import { serve } from '@hono/node-server'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createApp } from '../createApp'
import { createPostgresPool, createPostgresRepositories } from '../lib/deps/postgres'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required for the PostgreSQL server.')
}

const openApiSpec = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../../docs/openapi.yaml'),
  'utf8',
)
const pool = createPostgresPool(databaseUrl)
const repos = createPostgresRepositories(pool)

const app = createApp({
  injectRepos: async (c, next) => {
    c.set('repos', repos)
    await next()
  },
  openApiSpec,
})

const port = Number(process.env.PORT) || 3000
const firebaseProjectId = process.env.FIREBASE_PROJECT_ID

serve({
  port,
  fetch: (request) =>
    app.fetch(request, {
      FIREBASE_PROJECT_ID: firebaseProjectId,
    }),
})

console.log(`PostgreSQL API listening on http://localhost:${port}`)
