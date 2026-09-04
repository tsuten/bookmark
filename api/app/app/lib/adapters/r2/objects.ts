import type { ObjectStore, StoredObject } from '../../ports/objects'

const CACHE_CONTROL = 'public, max-age=86400'

export function createR2ObjectStore(bucket: R2Bucket): ObjectStore {
  return {
    async get(key: string): Promise<StoredObject | null> {
      const existing = await bucket.get(key)
      if (!existing) {
        return null
      }
      return {
        bytes: await existing.arrayBuffer(),
        contentType: existing.httpMetadata?.contentType ?? 'application/octet-stream',
      }
    },

    async put(key: string, bytes: ArrayBuffer, contentType: string): Promise<void> {
      await bucket.put(key, bytes, {
        httpMetadata: {
          contentType,
          cacheControl: CACHE_CONTROL,
        },
      })
    },
  }
}
