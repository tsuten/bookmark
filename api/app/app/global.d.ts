import type {} from 'hono'

declare module 'hono' {
  interface Env {
    Variables: {}
    Bindings: {
      DB: D1Database
      FIREBASE_PROJECT_ID: string
      BROWSER: BrowserRun
    }
  }
}
