import type {} from 'hono'

declare module 'hono' {
  interface Env {
    Variables: {}
    Bindings: {
      DB: D1Database
      FIREBASE_PROJECT_ID: string
      BROWSER: BrowserRun
      FAVICONS: R2Bucket
      LEAFEE_PINNED_TAGS: KVNamespace
    }
  }
}

declare module '*.yaml?raw' {
  const content: string
  export default content
}
