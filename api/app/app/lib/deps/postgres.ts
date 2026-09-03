import { Pool } from 'pg'
import { createPostgresBookmarkRepository } from '../adapters/postgres/bookmarks'
import { createPostgresProfileRepository } from '../adapters/postgres/profiles'
import { getPostgresDb } from '../db/postgres'
import type { AppRepos } from '../deps'

export function createPostgresPool(connectionString: string): Pool {
  return new Pool({ connectionString })
}

export function createPostgresRepositories(pool: Pool): AppRepos {
  const db = getPostgresDb(pool)
  return {
    bookmarks: createPostgresBookmarkRepository(db),
    profiles: createPostgresProfileRepository(db),
  }
}
