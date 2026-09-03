import type { AppRepos } from './lib/deps'

declare module 'hono' {
  interface Env {
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
}
