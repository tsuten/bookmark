import { createD1BookmarkRepository } from '../adapters/d1/bookmarks'
import { createD1ProfileRepository } from '../adapters/d1/profiles'
import { getD1Db } from '../db/d1'
import type { AppRepos } from '../deps'

export function createD1Repositories(d1: D1Database): AppRepos {
  const db = getD1Db(d1)
  return {
    bookmarks: createD1BookmarkRepository(db),
    profiles: createD1ProfileRepository(db),
  }
}
