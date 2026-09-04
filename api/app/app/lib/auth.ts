import type { Context } from 'hono'
import { getTokenVerifier } from './deps'

export async function requireUserId(c: Context): Promise<string | null> {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice('Bearer '.length).trim()
  if (!token) {
    return null
  }

  const { userId } = await getTokenVerifier(c).verify(token)
  return userId
}
