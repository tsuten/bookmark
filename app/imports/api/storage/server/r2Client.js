import { Meteor } from 'meteor/meteor';
import { S3Client } from '@aws-sdk/client-s3';

let s3Client = null;

function getR2Settings() {
  const settings = Meteor.settings?.r2;
  if (
    !settings?.accountId ||
    !settings?.accessKeyId ||
    !settings?.secretAccessKey ||
    !settings?.bucket
  ) {
    return null;
  }
  return settings;
}

export function isStorageConfigured() {
  return getR2Settings() !== null;
}

export function getStorageBucket() {
  return getR2Settings()?.bucket ?? null;
}

export function getPublicBaseUrl() {
  const baseUrl = Meteor.settings?.public?.storage?.publicBaseUrl;
  if (!baseUrl || typeof baseUrl !== 'string') {
    return null;
  }
  return baseUrl.replace(/\/$/, '');
}

export function getS3Client() {
  const settings = getR2Settings();
  if (!settings) {
    return null;
  }

  if (!s3Client) {
    s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${settings.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: settings.accessKeyId,
        secretAccessKey: settings.secretAccessKey,
      },
    });
  }

  return s3Client;
}

Meteor.startup(() => {
  if (!getR2Settings()) {
    console.warn(
      '[r2] Meteor.settings.r2 is missing or incomplete. ' +
        'Object storage is disabled. See settings.example.json.'
    );
    return;
  }

  if (!getPublicBaseUrl()) {
    console.warn(
      '[r2] Meteor.settings.public.storage.publicBaseUrl is missing. ' +
        'Uploaded assets will be stored without a public URL.'
    );
  }
});
