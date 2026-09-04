import { GetObjectCommand, PutObjectCommand, S3Client, S3ServiceException } from '@aws-sdk/client-s3'
import type { ObjectStore, StoredObject } from '../../ports/objects'

const CACHE_CONTROL = 'public, max-age=86400'

export type S3ObjectStoreConfig = {
  endpoint: string
  region: string
  bucket: string
  accessKeyId: string
  secretAccessKey: string
  forcePathStyle?: boolean
}

export function createS3Client(config: Omit<S3ObjectStoreConfig, 'bucket'>): S3Client {
  return new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: config.forcePathStyle ?? true,
  })
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return copy.buffer
}

export function createS3ObjectStore(client: S3Client, bucket: string): ObjectStore {
  return {
    async get(key: string): Promise<StoredObject | null> {
      try {
        const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
        const body = await result.Body?.transformToByteArray()
        if (!body || body.byteLength === 0) {
          return null
        }
        return {
          bytes: toArrayBuffer(body),
          contentType: result.ContentType ?? 'application/octet-stream',
        }
      } catch (error) {
        if (
          error instanceof S3ServiceException &&
          (error.name === 'NoSuchKey' || error.$metadata.httpStatusCode === 404)
        ) {
          return null
        }
        throw error
      }
    },

    async put(key: string, bytes: ArrayBuffer, contentType: string): Promise<void> {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: new Uint8Array(bytes),
          ContentType: contentType,
          CacheControl: CACHE_CONTROL,
        }),
      )
    },
  }
}

export function createS3ObjectStoreFromConfig(config: S3ObjectStoreConfig): ObjectStore {
  const { bucket, ...clientConfig } = config
  return createS3ObjectStore(createS3Client(clientConfig), bucket)
}
