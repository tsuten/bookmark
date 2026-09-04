import type { Context } from 'hono'
import { ApiError } from './errors'
import type { BookmarkRepository } from './ports/bookmarks'
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
