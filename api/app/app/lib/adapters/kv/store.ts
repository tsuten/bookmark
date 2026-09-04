import type { KvStore } from '../../ports/kv'

export function createCloudflareKvStore(namespace: KVNamespace): KvStore {
  return {
    async getJson<T>(key: string): Promise<T | null> {
      const stored = await namespace.get(key, 'json')
      return (stored as T | null) ?? null
    },

    async putJson(key: string, value: unknown): Promise<void> {
      await namespace.put(key, JSON.stringify(value))
    },
  }
}
