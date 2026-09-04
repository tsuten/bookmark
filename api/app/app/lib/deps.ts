import type { Context } from 'hono'
import { ApiError } from './errors'
import type { TokenVerifier } from './ports/auth'
import type { BookmarkRepository } from './ports/bookmarks'
import type { KvStore } from './ports/kv'
import type { ObjectStore } from './ports/objects'
import type { ProfileRepository } from './ports/profiles'

export type AppRepos = {
  bookmarks: BookmarkRepository
  profiles: ProfileRepository
}

export function getRepos(c: Context): AppRepos {
  const repos = c.get('repos')
  if (!repos) {
    throw new Error('Database repositories are not injected.')
  }
  return repos
}

export function getObjectStore(c: Context): ObjectStore {
  const store = c.get('objects')
  if (!store) {
    throw new ApiError('not-configured', 'Object store is not configured.', 503)
  }
  return store
}

export function getKvStore(c: Context): KvStore {
  const store = c.get('kv')
  if (!store) {
    throw new ApiError('not-configured', 'Key-value store is not configured.', 503)
  }
  return store
}

export function getTokenVerifier(c: Context): TokenVerifier {
  const verifier = c.get('auth')
  if (!verifier) {
    throw new ApiError('not-configured', 'Auth is not configured on the server.', 503)
  }
  return verifier
}
