import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import {
  getPublicBaseUrl,
  getS3Client,
  getStorageBucket,
  isStorageConfigured,
} from './r2Client';

export function getPublicUrl(key) {
  const baseUrl = getPublicBaseUrl();
  if (!baseUrl || !key) {
    return null;
  }
  return `${baseUrl}/${key}`;
}

export async function putObject(key, body, contentType) {
  if (!isStorageConfigured()) {
    return false;
  }

  const client = getS3Client();
  const bucket = getStorageBucket();
  if (!client || !bucket) {
    return false;
  }

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return true;
}

export async function deleteObject(key) {
  if (!isStorageConfigured() || !key) {
    return false;
  }

  const client = getS3Client();
  const bucket = getStorageBucket();
  if (!client || !bucket) {
    return false;
  }

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );

  return true;
}

export async function deleteObjectsByPrefix(prefix) {
  if (!isStorageConfigured() || !prefix) {
    return 0;
  }

  const client = getS3Client();
  const bucket = getStorageBucket();
  if (!client || !bucket) {
    return 0;
  }

  let deletedCount = 0;
  let continuationToken;

  do {
    const listResponse = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
    );

    const keys = (listResponse.Contents || [])
      .map((item) => item.Key)
      .filter(Boolean);

    if (keys.length > 0) {
      await client.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: keys.map((Key) => ({ Key })),
          },
        })
      );
      deletedCount += keys.length;
    }

    continuationToken = listResponse.IsTruncated
      ? listResponse.NextContinuationToken
      : undefined;
  } while (continuationToken);

  return deletedCount;
}
