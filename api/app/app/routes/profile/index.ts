import { createRoute } from 'honox/factory'
import { ApiError } from '../../lib/errors'
import {
  cleanProfileCreateInput,
  cleanProfileUpdateInput,
  deleteProfile,
  ensureProfile,
  getProfile,
  serializeProfile,
  updateProfile,
} from '../../lib/profiles'
import {
  handleProfileDeleteRoute,
  handleProfileJsonRoute,
  handleProfileUpsertRoute,
} from '../../lib/routeHelpers'

export const POST = createRoute(async (c) => {
  return handleProfileUpsertRoute(c, async (userId, body) => {
    const input = cleanProfileCreateInput(body as Record<string, unknown>)
    const { profile, created } = await ensureProfile(c.env.DB, userId, input)
    return { data: serializeProfile(profile), created }
  })
})

export const GET = createRoute(async (c) => {
  return handleProfileJsonRoute(c, async (userId, _body) => {
    const profile = await getProfile(c.env.DB, userId)
    if (!profile) {
      throw new ApiError('not-found', 'Profile not found.', 404)
    }
    return serializeProfile(profile)
  })
})

export const PATCH = createRoute(async (c) => {
  return handleProfileJsonRoute(c, async (userId, body) => {
    const { displayName } = cleanProfileUpdateInput(body as Record<string, unknown>)
    const updated = await updateProfile(c.env.DB, userId, { displayName })
    if (!updated) {
      throw new ApiError('not-found', 'Profile not found.', 404)
    }
    return serializeProfile(updated)
  })
})

export const DELETE = createRoute(async (c) => {
  return handleProfileDeleteRoute(c, async (userId) => {
    const deleted = await deleteProfile(c.env.DB, userId)
    if (!deleted) {
      throw new ApiError('not-found', 'Profile not found.', 404)
    }
  })
})
