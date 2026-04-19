import { Meteor } from 'meteor/meteor';
import { BookmarkItemsCollection } from '/imports/api/bookmarkItems';
import { BookmarkCollectionsCollection } from '/imports/api/bookmarkCollections';

async function insertBookmarkItem({ title, url, tags }) {
  await BookmarkItemsCollection.insertAsync({ title, url, tags, createdAt: new Date() });
}

async function insertBookmarkCollection({ name, bookmarkItems }) {
  await BookmarkCollectionsCollection.insertAsync({ name, bookmarkItems, createdAt: new Date() });
}

Meteor.methods({
  addBookmarkItem(title, url, tags) {
    insertBookmarkItem({ title, url, tags });
  }
});

Meteor.startup(async () => {

  // If the BookmarkItems collection is empty, add some data.
  if (await BookmarkItemsCollection.find().countAsync() === 0) {
    await insertBookmarkItem({
      title: 'Google',
      url: 'https://www.google.com',
      tags: ['search', 'engine']
    });
    await insertBookmarkItem({
      title: 'Microsoft',
      url: 'https://www.microsoft.com',
      tags: ['software', 'company']
    });
    await insertBookmarkItem({
      title: 'Apple',
      url: 'https://www.apple.com',
      tags: ['technology', 'company']
    });
    }

  // If the BookmarkCollections collection is empty, add some data.
  if (await BookmarkCollectionsCollection.find().countAsync() === 0) {
    await insertBookmarkCollection({
      name: 'My Collections',
    });
  }

  // We publish the entire Links collection to all clients.
  // In order to be fetched in real-time to the clients
  Meteor.publish("bookmarkItems", function () {
    return BookmarkItemsCollection.find();
  });

  Meteor.publish("bookmarkCollections", function () {
    return BookmarkCollectionsCollection.find();
  });

  Meteor.publish('bookmarkTags', function () {
    return BookmarkItemsCollection.find(
      {},
      { fields: { tags: 1 } }
    );
  });
});
