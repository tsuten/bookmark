import type { Context } from 'hono'
import { ApiError } from '../../lib/errors'
import { getRepos } from '../../lib/deps'
import {
  cleanProfileCreateInput,
  cleanProfileUpdateInput,
  serializeProfile,
} from '../../lib/profiles'
import {
  handleProfileDeleteRoute,
  handleProfileJsonRoute,
  handleProfileUpsertRoute,
} from '../../lib/routeHelpers'

export const POST = async (c: Context) => {
  return handleProfileUpsertRoute(c, async (userId, body) => {
    const input = cleanProfileCreateInput(body as Record<string, unknown>)
    const { profile, created } = await getRepos(c).profiles.ensure(userId, input)
    return { data: serializeProfile(profile), created }
  })
}

export const GET = async (c: Context) => {
  return handleProfileJsonRoute(c, async (userId, _body) => {
    const profile = await getRepos(c).profiles.get(userId)
    if (!profile) {
      throw new ApiError('not-found', 'Profile not found.', 404)
    }
    return serializeProfile(profile)
  })
}

export const PATCH = async (c: Context) => {
  return handleProfileJsonRoute(c, async (userId, body) => {
    const { displayName } = cleanProfileUpdateInput(body as Record<string, unknown>)
    const updated = await getRepos(c).profiles.update(userId, { displayName })
    if (!updated) {
      throw new ApiError('not-found', 'Profile not found.', 404)
    }
    return serializeProfile(updated)
  })
}

export const DELETE = async (c: Context) => {
  return handleProfileDeleteRoute(c, async (userId) => {
    const deleted = await getRepos(c).profiles.delete(userId)
    if (!deleted) {
      throw new ApiError('not-found', 'Profile not found.', 404)
    }
  })
}
