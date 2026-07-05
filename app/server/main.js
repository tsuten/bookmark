import { Meteor } from 'meteor/meteor';
import { BookmarkItemsCollection } from '/imports/api/bookmarkItems';
import { BookmarkCollectionsCollection } from '/imports/api/bookmarkCollections';
import { WebApp } from 'meteor/webapp';
import '/imports/api/auth/server/firebaseAdmin';
import '/imports/api/auth/server/loginHandler';

Meteor.startup(async () => {
  Meteor.publish('bookmarkItems', function () {
    if (!this.userId) {
      return this.ready();
    }
    return BookmarkItemsCollection.find({ userId: this.userId });
  });

  Meteor.publish('bookmarkCollections', function () {
    if (!this.userId) {
      return this.ready();
    }
    return BookmarkCollectionsCollection.find({ userId: this.userId });
  });

  Meteor.publish('bookmarkTags', function () {
    if (!this.userId) {
      return this.ready();
    }
    return BookmarkItemsCollection.find(
      { userId: this.userId },
      { fields: { tags: 1 } }
    );
  });
});

WebApp.connectHandlers.use('/api/health', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'OK' }));
});
