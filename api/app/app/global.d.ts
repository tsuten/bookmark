import type { AppRepos } from './lib/deps'
import type { TokenVerifier } from './lib/ports/auth'
import type { KvStore } from './lib/ports/kv'
import type { ObjectStore } from './lib/ports/objects'

declare module 'hono' {
  interface Env {
    Variables: {
      repos: AppRepos
      objects?: ObjectStore
      kv?: KvStore
      auth?: TokenVerifier
    }
    Bindings: {
      DB?: D1Database
      FIREBASE_PROJECT_ID?: string
      AUTH_DRIVER?: string
      LOGTO_ENDPOINT?: string
      LOGTO_AUDIENCE?: string
      LOGTO_ISSUER?: string
      BROWSER?: BrowserRun
      FAVICONS?: R2Bucket
      LEAFEE_PINNED_TAGS?: KVNamespace
    }
  }
}
