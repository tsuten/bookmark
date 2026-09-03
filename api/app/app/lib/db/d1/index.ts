import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema'

export function getD1Db(d1: D1Database) {
  return drizzle(d1, { schema })
}

export type D1Db = ReturnType<typeof getD1Db>
