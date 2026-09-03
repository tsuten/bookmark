import { eq } from 'drizzle-orm'
import type { D1Db } from '../../db/d1'
import { profiles } from '../../db/d1/schema'
import { ApiError } from '../../errors'
import type { ProfileRepository } from '../../ports/profiles'
import type { ProfileRecord } from '../../ports/types'

export function createD1ProfileRepository(db: D1Db): ProfileRepository {
  return {
    async ensure(userId, input) {
      const existing = await db.select().from(profiles).where(eq(profiles.userId, userId)).get()
      if (existing) {
        return { profile: existing, created: false as const }
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

      const profile = await db.select().from(profiles).where(eq(profiles.userId, userId)).get()
      if (!profile) {
        throw new ApiError('internal-error', 'Failed to create profile.', 500)
      }

      return { profile, created: false as const }
    },

    async get(userId) {
      return (await db.select().from(profiles).where(eq(profiles.userId, userId)).get()) ?? null
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
      return (result.meta?.changes ?? 0) > 0
    },
  }
}
