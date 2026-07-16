import type { Context } from 'hono'
import { verifyFirebaseIdToken } from './auth/firebase'
import { ApiError } from './errors'

export async function requireUserId(c: Context): Promise<string | null> {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice('Bearer '.length).trim()
  if (!token) {
    return null
  }

  const projectId = c.env.FIREBASE_PROJECT_ID
  if (!projectId) {
    throw new ApiError(
      'firebase-not-configured',
      'Firebase is not configured on the server.',
      503,
    )
  }

  const { uid } = await verifyFirebaseIdToken(token, projectId)
  return uid
}
