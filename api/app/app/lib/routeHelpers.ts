import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { requireUserId } from './auth'
import { ApiError, toErrorResponse } from './errors'

function jsonError(c: Context, error: ApiError) {
  return c.json(toErrorResponse(error), error.status as ContentfulStatusCode)
}

export async function requireAuthorizedUser(c: Context) {
  const userId = await requireUserId(c)
  if (!userId) {
    throw new ApiError('not-authorized', 'Not authorized.', 401)
  }
  return userId
}

export async function handleBookmarkRoute(c: Context, handler: (userId: string, body: unknown) => Promise<void>) {
  try {
    const userId = await requireAuthorizedUser(c)
    const body = await c.req.json().catch(() => ({}))
    await handler(userId, body)
    return c.json({ ok: true })
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(c, error)
    }
    throw error
  }
}

export async function handleBookmarkJsonRoute<T>(
  c: Context,
  handler: (userId: string) => Promise<T>,
) {
  try {
    const userId = await requireAuthorizedUser(c)
    return c.json(await handler(userId))
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(c, error)
    }
    throw error
  }
}

export async function handleProfileJsonRoute<T>(
  c: Context,
  handler: (userId: string, body: unknown) => Promise<T>,
) {
  try {
    const userId = await requireAuthorizedUser(c)
    const body = await c.req.json().catch(() => ({}))
    return c.json(await handler(userId, body))
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(c, error)
    }
    throw error
  }
}

export async function handleProfileUpsertRoute<T>(
  c: Context,
  handler: (userId: string, body: unknown) => Promise<{ data: T; created: boolean }>,
) {
  try {
    const userId = await requireAuthorizedUser(c)
    const body = await c.req.json().catch(() => ({}))
    const { data, created } = await handler(userId, body)
    return c.json(data, (created ? 201 : 200) as ContentfulStatusCode)
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(c, error)
    }
    throw error
  }
}

export async function handleProfileDeleteRoute(c: Context, handler: (userId: string) => Promise<void>) {
  try {
    const userId = await requireAuthorizedUser(c)
    await handler(userId)
    return c.json({ ok: true })
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(c, error)
    }
    throw error
  }
}
