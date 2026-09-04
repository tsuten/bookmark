import Redis from 'ioredis'
import { createValkeyStore } from '../adapters/valkey/store'
import type { KvStore } from '../ports/kv'

export function createValkeyStoreFromEnv(env: NodeJS.ProcessEnv = process.env): KvStore | null {
  const url = env.VALKEY_URL
  if (!url) {
    return null
  }

  const redis = new Redis(url, {
    maxRetriesPerRequest: 1,
    lazyConnect: false,
  })

  return createValkeyStore(redis)
}
