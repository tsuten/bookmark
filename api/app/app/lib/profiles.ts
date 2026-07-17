import { getProfileModel } from './db/models/Profile'
import { ApiError } from './errors'

function trimString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  return value.trim()
}

export function serializeProfile(doc: {
  userId: string
  displayName: string
  createdAt: Date
  updatedAt?: Date
}) {
  return {
    userId: doc.userId,
    displayName: doc.displayName,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: (doc.updatedAt ?? doc.createdAt).toISOString(),
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

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: number }).code === 11000
  )
}

export async function ensureProfile(userId: string, input: { displayName: string }) {
  const ProfileModel = await getProfileModel()
  const existing = await ProfileModel.findOne({ userId }).lean()
  if (existing) {
    return { profile: existing, created: false as const }
  }

  const now = new Date()
  try {
    const created = await ProfileModel.create({
      userId,
      displayName: input.displayName,
      createdAt: now,
      updatedAt: now,
    })
    return { profile: created.toObject(), created: true as const }
  } catch (error) {
    if (!isDuplicateKeyError(error)) {
      throw error
    }
    const profile = await ProfileModel.findOne({ userId }).lean()
    if (!profile) {
      throw error
    }
    return { profile, created: false as const }
  }
}
