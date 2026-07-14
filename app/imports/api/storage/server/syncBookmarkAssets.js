import { BookmarkItemsCollection } from '../../bookmarkItems';
import {
  deleteObjectsByPrefix,
  getPublicUrl,
  putObject,
} from './objectStorage';
import { downloadAsset, scrapePageMetadata } from './scrapePageAssets';
import { isStorageConfigured } from './r2Client';

function bookmarkAssetPrefix(userId, bookmarkId) {
  return `users/${userId}/bookmarks/${bookmarkId}`;
}

export async function deleteBookmarkAssets(userId, bookmarkId) {
  if (!isStorageConfigured()) {
    return;
  }

  await deleteObjectsByPrefix(`${bookmarkAssetPrefix(userId, bookmarkId)}/`);
}

async function uploadAsset(userId, bookmarkId, assetName, sourceUrl, pageUrl) {
  const asset = await downloadAsset(sourceUrl, pageUrl);
  if (!asset) {
    return null;
  }

  const key = `${bookmarkAssetPrefix(userId, bookmarkId)}/${assetName}.${asset.extension}`;
  const uploaded = await putObject(key, asset.body, asset.contentType);
  if (!uploaded) {
    return null;
  }

  return {
    key,
    url: getPublicUrl(key),
  };
}

export async function syncBookmarkAssets(bookmarkId, userId, pageUrl) {
  try {
    const metadata = await scrapePageMetadata(pageUrl);
    const update = {
      scrapedAt: new Date(),
    };

    if (metadata.ogTitle) {
      update.ogTitle = metadata.ogTitle;
    }
    if (metadata.ogDescription) {
      update.ogDescription = metadata.ogDescription;
    }

    const bookmark = await BookmarkItemsCollection.findOneAsync({
      _id: bookmarkId,
      userId,
    });

    if (
      bookmark &&
      (!bookmark.title || bookmark.title === 'untitled') &&
      metadata.ogTitle
    ) {
      update.title = metadata.ogTitle;
    }

    if (isStorageConfigured()) {
      await deleteBookmarkAssets(userId, bookmarkId);

      const preview = metadata.previewImageUrl
        ? await uploadAsset(
            userId,
            bookmarkId,
            'preview',
            metadata.previewImageUrl,
            pageUrl
          )
        : null;
      if (preview) {
        update.previewImageKey = preview.key;
        update.previewImageUrl = preview.url;
      } else {
        update.previewImageKey = null;
        update.previewImageUrl = null;
      }

      const favicon = metadata.faviconUrl
        ? await uploadAsset(
            userId,
            bookmarkId,
            'favicon',
            metadata.faviconUrl,
            pageUrl
          )
        : null;
      if (favicon) {
        update.faviconKey = favicon.key;
        update.faviconUrl = favicon.url;
      } else {
        update.faviconKey = null;
        update.faviconUrl = null;
      }
    }

    const $set = {};
    const $unset = {};

    for (const [field, value] of Object.entries(update)) {
      if (value === null) {
        $unset[field] = '';
      } else {
        $set[field] = value;
      }
    }

    const mongoUpdate = {};
    if (Object.keys($set).length > 0) {
      mongoUpdate.$set = $set;
    }
    if (Object.keys($unset).length > 0) {
      mongoUpdate.$unset = $unset;
    }

    await BookmarkItemsCollection.updateAsync(
      { _id: bookmarkId, userId },
      mongoUpdate
    );
  } catch (error) {
    console.error(
      `[bookmark-assets] Failed to sync assets for bookmark ${bookmarkId}:`,
      error
    );
  }
}
