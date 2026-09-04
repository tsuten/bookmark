import { ApiError } from './errors'
import type { KvStore } from './ports/kv'

const MAX_PINNED_TAGS = 50

export type PinnedTagsPayload = {
  pinned_tags: string[]
}

export function pinnedTagsKey(userId: string): string {
  return `pinned_tags:${userId}`
}

export function parsePinnedTagsBody(body: unknown): string[] {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError('invalid-args', 'Request body must be an object.')
  }

  const pinnedTags = (body as { pinned_tags?: unknown }).pinned_tags
  if (!Array.isArray(pinnedTags) || !pinnedTags.every((tag) => typeof tag === 'string')) {
    throw new ApiError('invalid-args', 'pinned_tags must be an array of strings.')
  }

  const normalized: string[] = []
  const seen = new Set<string>()

  for (const tag of pinnedTags) {
    const trimmed = tag.trim()
    if (!trimmed) {
      throw new ApiError('invalid-args', 'pinned_tags must not contain empty strings.')
    }
    if (seen.has(trimmed)) {
      throw new ApiError('invalid-args', 'pinned_tags must not contain duplicates.')
    }
    seen.add(trimmed)
    normalized.push(trimmed)
  }

  if (normalized.length > MAX_PINNED_TAGS) {
    throw new ApiError('invalid-args', `pinned_tags must contain at most ${MAX_PINNED_TAGS} tags.`)
  }

  return normalized
}

function isPinnedTagsPayload(value: unknown): value is PinnedTagsPayload {
  return (
    value !== null &&
    typeof value === 'object' &&
    Array.isArray((value as PinnedTagsPayload).pinned_tags) &&
    (value as PinnedTagsPayload).pinned_tags.every((tag) => typeof tag === 'string')
  )
}

export async function getPinnedTags(kv: KvStore, userId: string): Promise<string[]> {
  const stored = await kv.getJson<unknown>(pinnedTagsKey(userId))
  if (!isPinnedTagsPayload(stored)) {
    return []
  }
  return stored.pinned_tags
}

export async function putPinnedTags(
  kv: KvStore,
  userId: string,
  pinnedTags: string[],
): Promise<PinnedTagsPayload> {
  const payload: PinnedTagsPayload = { pinned_tags: pinnedTags }
  await kv.putJson(pinnedTagsKey(userId), payload)
  return payload
}
