import { createS3ObjectStoreFromConfig } from '../adapters/s3/objects'
import type { ObjectStore } from '../ports/objects'

export function createS3ObjectStoreFromEnv(env: NodeJS.ProcessEnv = process.env): ObjectStore | null {
  const endpoint = env.S3_ENDPOINT
  const bucket = env.S3_BUCKET
  const accessKeyId = env.S3_ACCESS_KEY
  const secretAccessKey = env.S3_SECRET_KEY
  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    return null
  }

  return createS3ObjectStoreFromConfig({
    endpoint,
    region: env.S3_REGION || 'us-east-1',
    bucket,
    accessKeyId,
    secretAccessKey,
    forcePathStyle: env.S3_FORCE_PATH_STYLE !== 'false',
  })
}
