export type KvStore = {
  getJson<T>(key: string): Promise<T | null>
  putJson(key: string, value: unknown): Promise<void>
}
