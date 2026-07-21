import { eq } from 'drizzle-orm'
import { getDb } from './db'
import { profiles } from './db/schema'
import { ApiError } from './errors'

function trimString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  return value.trim()
}

export function serializeProfile(doc: {
  userId: string
  displayName: string
  createdAt: string
  updatedAt: string
}) {
  return {
    userId: doc.userId,
    displayName: doc.displayName,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

export function cleanProfileCreateInput(body: Record<string, unknown> = {}) {
  const displayName = trimString(body.displayName) ?? ''
  return { displayName }
}

export function cleanProfileUpdateInput(body: Record<string, unknown> = {}) {
  if (body.displayName === undefined) {
    throw new ApiError('invalid-args', 'displayName is required.')
  }
  if (typeof body.displayName !== 'string') {
    throw new ApiError('invalid-args', 'displayName must be a string.')
  }
  return { displayName: body.displayName.trim() }
}

export async function ensureProfile(
  db: D1Database,
  userId: string,
  input: { displayName: string },
) {
  const drizzle = getDb(db)
  const existing = await drizzle.select().from(profiles).where(eq(profiles.userId, userId)).get()
  if (existing) {
    return { profile: existing, created: false as const }
  }

  const now = new Date().toISOString()
  const inserted = await drizzle
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

  const profile = await drizzle.select().from(profiles).where(eq(profiles.userId, userId)).get()
  if (!profile) {
    throw new ApiError('internal-error', 'Failed to create profile.', 500)
  }

  return { profile, created: false as const }
}

export async function getProfile(db: D1Database, userId: string) {
  const drizzle = getDb(db)
  return drizzle.select().from(profiles).where(eq(profiles.userId, userId)).get()
}

export async function updateProfile(
  db: D1Database,
  userId: string,
  input: { displayName: string },
) {
  const drizzle = getDb(db)
  const updated = await drizzle
    .update(profiles)
    .set({
      displayName: input.displayName,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(profiles.userId, userId))
    .returning()

  return updated[0] ?? null
}

export async function deleteProfile(db: D1Database, userId: string): Promise<boolean> {
  const drizzle = getDb(db)
  const result = await drizzle.delete(profiles).where(eq(profiles.userId, userId))
  return (result.meta?.changes ?? 0) > 0
}
