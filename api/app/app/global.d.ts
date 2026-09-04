import type { AppRepos } from './lib/deps'
import type { ObjectStore } from './lib/ports/objects'

declare module 'hono' {
  interface Env {
    Variables: {
      repos: AppRepos
      objects?: ObjectStore
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
