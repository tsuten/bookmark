import type { Redis } from 'ioredis'
import type { KvStore } from '../../ports/kv'

export function createValkeyStore(redis: Redis): KvStore {
  return {
    async getJson<T>(key: string): Promise<T | null> {
      const stored = await redis.get(key)
      if (stored === null) {
        return null
      }
      try {
        return JSON.parse(stored) as T
      } catch {
        return null
      }
    },

    async putJson(key: string, value: unknown): Promise<void> {
      await redis.set(key, JSON.stringify(value))
    },
  }
}
