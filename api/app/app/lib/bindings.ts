import type { Context } from 'hono'
import { ApiError } from './errors'

export function requirePinnedTagsKv(c: Context): KVNamespace {
  const kv = c.env.LEAFEE_PINNED_TAGS
  if (!kv) {
    throw new ApiError('not-configured', 'Pinned tags store is not configured.', 503)
  }
  return kv
}

export function requireFaviconsBucket(c: Context): R2Bucket {
  const bucket = c.env.FAVICONS
  if (!bucket) {
    throw new ApiError('not-configured', 'Favicon store is not configured.', 503)
  }
  return bucket
}
