import { eq } from 'drizzle-orm'
import { ApiError } from '../../errors'
import type { PostgresDb } from '../../db/postgres'
import { profiles } from '../../db/postgres/schema'
import type { ProfileRepository } from '../../ports/profiles'
import type { ProfileRecord } from '../../ports/types'

export function createPostgresProfileRepository(db: PostgresDb): ProfileRepository {
  return {
    async ensure(userId, input) {
      const existing = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1)
      if (existing[0]) {
        return { profile: existing[0], created: false as const }
      }

      const now = new Date().toISOString()
      const inserted = await db
        .insert(profiles)
        .values({
          userId,
          displayName: input.displayName,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoNothing()
        .returning()

      if (inserted.length > 0) {
        return { profile: inserted[0], created: true as const }
      }

      const profile = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1)
      if (!profile[0]) {
        throw new ApiError('internal-error', 'Failed to create profile.', 500)
      }

      return { profile: profile[0], created: false as const }
    },

    async get(userId) {
      const rows = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1)
      return rows[0] ?? null
    },

    async update(userId, input): Promise<ProfileRecord | null> {
      const updated = await db
        .update(profiles)
        .set({
          displayName: input.displayName,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(profiles.userId, userId))
        .returning()

      return updated[0] ?? null
    },

    async delete(userId) {
      const result = await db.delete(profiles).where(eq(profiles.userId, userId))
      return (result.rowCount ?? 0) > 0
    },
  }
}

