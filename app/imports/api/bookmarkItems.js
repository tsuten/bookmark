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
      return 'URL を入力してください';
    case 'invalidHttpUrl':
      return 'http または https の有効な URL を入力してください';
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
});

export async function insertBookmarkItem(doc = {}) {
  const cleaned = BookmarkItemSchema.clean(doc);
  BookmarkItemSchema.validate(cleaned);
  await BookmarkItemsCollection.insertAsync({
    ...cleaned,
    createdAt: new Date(),
  });
}

Meteor.methods({
  addBookmarkItem(doc = {}) {
    return insertBookmarkItem(doc);
  },

  deleteBookmarkItem({ _id } = {}) {
    BookmarkItemsCollection.removeAsync({ _id });
  },
});
