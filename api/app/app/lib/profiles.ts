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
