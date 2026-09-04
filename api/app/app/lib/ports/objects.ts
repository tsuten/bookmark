export type StoredObject = {
  bytes: ArrayBuffer
  contentType: string
}

export type ObjectStore = {
  get(key: string): Promise<StoredObject | null>
  put(key: string, bytes: ArrayBuffer, contentType: string): Promise<void>
}
