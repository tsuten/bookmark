import type { Context } from 'hono'
import type { BookmarkRepository } from './ports/bookmarks'
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
