import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Meteor } from 'meteor/meteor';

export function validateHttpUrlString(value) {
  if (typeof value !== 'string' || !value.trim()) {
    return { valid: false, errorCode: 'required' };
  }
  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, errorCode: 'invalidHttpUrl' };
    }
    return { valid: true };
  } catch {
    return { valid: false, errorCode: 'invalidHttpUrl' };
  }
}

export function bookmarkUrlErrorMessage(errorCode) {
  switch (errorCode) {
    case 'required':
      return 'Please enter a URL.';
    case 'invalidHttpUrl':
      return 'Please enter a valid http or https URL.';
    default:
      return '';
  }
}

export const BookmarkItemsCollection = new Mongo.Collection('bookmarkItems');

function validateHttpUrl() {
  const result = validateHttpUrlString(this.value);
  if (result.valid) return;
  if (result.errorCode === 'required') {
    return SimpleSchema.ErrorTypes.REQUIRED;
  }
  return 'invalidHttpUrl';
}

export const BookmarkItemSchema = new SimpleSchema({
  title: { type: String, optional: true, defaultValue: 'untitled', trim: true },
  url: {
    type: String,
    trim: true,
    custom: validateHttpUrl,
  },
  tags: { type: Array, optional: true },
  'tags.$': String,
  note: { type: String, optional: true, trim: true, max: 500 },
  is_archived: { type: Boolean, optional: true, defaultValue: false },
  userId: { type: String },
});

export const BookmarkItemUpdateSchema = new SimpleSchema({
  title: { type: String, optional: true, defaultValue: 'untitled', trim: true },
  url: {
    type: String,
    trim: true,
    custom: validateHttpUrl,
  },
  tags: { type: Array, optional: true },
  'tags.$': String,
  note: { type: String, optional: true, trim: true, max: 500 },
});

export async function insertBookmarkItem(doc = {}, userId) {
  const cleaned = BookmarkItemSchema.clean({ ...doc, userId });
  BookmarkItemSchema.validate(cleaned);
  await BookmarkItemsCollection.insertAsync({
    ...cleaned,
    createdAt: new Date(),
  });
}

export async function updateBookmarkItem({ _id, ...doc } = {}, userId) {
  if (!_id) {
    throw new Meteor.Error('invalid-args', 'Bookmark _id is required.');
  }
  const cleaned = BookmarkItemUpdateSchema.clean(doc);
  BookmarkItemUpdateSchema.validate(cleaned);
  const updated = await BookmarkItemsCollection.updateAsync(
    { _id, userId },
    { $set: cleaned }
  );
  if (updated === 0) {
    throw new Meteor.Error('not-found', 'Bookmark not found.');
  }
}

Meteor.methods({
  async addBookmarkItem(doc = {}) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    return insertBookmarkItem(doc, this.userId);
  },

  async deleteBookmarkItem({ _id } = {}) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    // Filtering by userId ensures users can only delete their own bookmarks.
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

  async updateBookmarkItem({ _id, title, url, tags, note } = {}) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    return updateBookmarkItem({ _id, title, url, tags, note }, this.userId);
  },
});
