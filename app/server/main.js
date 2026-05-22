import { Meteor } from 'meteor/meteor';
import {
  BookmarkItemsCollection,
  insertBookmarkItem,
} from '/imports/api/bookmarkItems';
import { BookmarkCollectionsCollection } from '/imports/api/bookmarkCollections';

Meteor.startup(async () => {

  // If the BookmarkItems collection is empty, add some data.
  if (await BookmarkItemsCollection.find().countAsync() === 0) {
    await insertBookmarkItem({
      title: 'Google',
      url: 'https://www.google.com',
      note: 'The search engine',
      tags: ['search', 'engine'],
    });
    await insertBookmarkItem({
      title: 'Microsoft',
      url: 'https://www.microsoft.com',
      note: 'The software company',
      tags: ['software', 'company'],
    });
    await insertBookmarkItem({
      title: 'Apple',
      url: 'https://www.apple.com',
      note: 'The technology company',
      tags: ['technology', 'company'],
    });
  }

  // If the BookmarkCollections collection is empty, add some data.
  if (await BookmarkCollectionsCollection.find().countAsync() === 0) {
    await BookmarkCollectionsCollection.insertAsync({
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
