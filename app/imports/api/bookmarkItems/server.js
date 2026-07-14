import { Meteor } from 'meteor/meteor';
import {
  BookmarkItemsCollection,
  insertBookmarkItem,
  updateBookmarkItem,
} from '../bookmarkItems';
import {
  deleteBookmarkAssets,
  syncBookmarkAssets,
} from '../storage/server/syncBookmarkAssets';

function scheduleBookmarkAssetSync(bookmarkId, userId, pageUrl) {
  Meteor.defer(() => {
    syncBookmarkAssets(bookmarkId, userId, pageUrl).catch((error) => {
      console.error(
        `[bookmark-assets] Background sync failed for bookmark ${bookmarkId}:`,
        error
      );
    });
  });
}

Meteor.methods({
  async addBookmarkItem(doc = {}) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const bookmarkId = await insertBookmarkItem(doc, this.userId);
    const url = doc.url?.trim();
    if (bookmarkId && url) {
      scheduleBookmarkAssetSync(bookmarkId, this.userId, url);
    }

    return bookmarkId;
  },

  async deleteBookmarkItem({ _id } = {}) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    await deleteBookmarkAssets(this.userId, _id);
    await BookmarkItemsCollection.removeAsync({ _id, userId: this.userId });
  },

  async archiveBookmarkItem({ _id } = {}) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const updated = await BookmarkItemsCollection.updateAsync(
      { _id, userId: this.userId },
      { $set: { is_archived: true } }
    );
    if (updated === 0) {
      throw new Meteor.Error('not-found', 'Bookmark not found.');
    }
  },

  async updateBookmarkItem({ _id, title, url, tags } = {}) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const existing = await BookmarkItemsCollection.findOneAsync({
      _id,
      userId: this.userId,
    });
    if (!existing) {
      throw new Meteor.Error('not-found', 'Bookmark not found.');
    }

    await updateBookmarkItem({ _id, title, url, tags }, this.userId);

    const nextUrl = url?.trim();
    if (nextUrl && nextUrl !== existing.url) {
      scheduleBookmarkAssetSync(_id, this.userId, nextUrl);
    }
  },
});
