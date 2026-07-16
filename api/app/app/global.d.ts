import type {} from 'hono'

declare module 'hono' {
  interface Env {
    Variables: {}
    Bindings: {
      MONGODB_URI: string
      FIREBASE_PROJECT_ID: string
    }
  }
}
