import { createRoute } from 'honox/factory'
import { getProfileModel } from '../../lib/db/models/Profile'
import { ApiError } from '../../lib/errors'
import {
  cleanProfileCreateInput,
  cleanProfileUpdateInput,
  ensureProfile,
  serializeProfile,
} from '../../lib/profiles'
import {
  handleProfileDeleteRoute,
  handleProfileJsonRoute,
  handleProfileUpsertRoute,
} from '../../lib/routeHelpers'

export const POST = createRoute(async (c) => {
  return handleProfileUpsertRoute(c, async (userId, body) => {
    const input = cleanProfileCreateInput(body as Record<string, unknown>)
    const { profile, created } = await ensureProfile(userId, input)
    return { data: serializeProfile(profile), created }
  })
})

export const GET = createRoute(async (c) => {
  return handleProfileJsonRoute(c, async (userId, _body) => {
    const ProfileModel = await getProfileModel()
    const profile = await ProfileModel.findOne({ userId }).lean()
    if (!profile) {
      throw new ApiError('not-found', 'Profile not found.', 404)
    }
    return serializeProfile(profile)
  })
})

export const PATCH = createRoute(async (c) => {
  return handleProfileJsonRoute(c, async (userId, body) => {
    const { displayName } = cleanProfileUpdateInput(body as Record<string, unknown>)
    const ProfileModel = await getProfileModel()
    const updated = await ProfileModel.findOneAndUpdate(
      { userId },
      { $set: { displayName, updatedAt: new Date() } },
      { new: true },
    ).lean()
    if (!updated) {
      throw new ApiError('not-found', 'Profile not found.', 404)
    }
    return serializeProfile(updated)
  })
})

export const DELETE = createRoute(async (c) => {
  return handleProfileDeleteRoute(c, async (userId) => {
    const ProfileModel = await getProfileModel()
    const deleted = await ProfileModel.deleteOne({ userId })
    if (deleted.deletedCount === 0) {
      throw new ApiError('not-found', 'Profile not found.', 404)
    }
  })
})
