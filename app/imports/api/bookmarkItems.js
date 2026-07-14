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
  note: { type: String, optional: true, trim: true },
  is_archived: { type: Boolean, optional: true, defaultValue: false },
  previewImageKey: { type: String, optional: true },
  previewImageUrl: { type: String, optional: true },
  faviconKey: { type: String, optional: true },
  faviconUrl: { type: String, optional: true },
  ogTitle: { type: String, optional: true, trim: true },
  ogDescription: { type: String, optional: true, trim: true },
  scrapedAt: { type: Date, optional: true },
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
});

export async function insertBookmarkItem(doc = {}, userId) {
  const cleaned = BookmarkItemSchema.clean({ ...doc, userId });
  BookmarkItemSchema.validate(cleaned);
  return BookmarkItemsCollection.insertAsync({
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

