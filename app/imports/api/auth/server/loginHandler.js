import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { getFirebaseAdminAuth } from './firebaseAdmin';

// Custom login handler: the client sends a Firebase ID token, we verify it
// and map the Firebase uid to a Meteor user (services.firebase.uid).
// The handler only looks at the uid, so adding providers later via Firebase
// account linking requires no server changes.
Accounts.registerLoginHandler('firebase', async (options) => {
  if (!options.firebase) {
    return undefined; // not handled by this handler
  }

  const adminAuth = getFirebaseAdminAuth();
  if (!adminAuth) {
    throw new Meteor.Error(
      'firebase-not-configured',
      'Firebase admin is not configured on the server.'
    );
  }

  const { idToken } = options.firebase;
  if (typeof idToken !== 'string' || !idToken) {
    throw new Meteor.Error('invalid-request', 'idToken is required.');
  }

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(idToken);
  } catch (error) {
    throw new Meteor.Error('invalid-token', 'Failed to verify Firebase ID token.');
  }

  const { uid, email, name } = decoded;

  const existingUser = await Meteor.users.findOneAsync({
    'services.firebase.uid': uid,
  });

  if (existingUser) {
    // Keep email / displayName in sync with Firebase.
    const $set = {};
    if (email) {
      $set.emails = [{ address: email, verified: !!decoded.email_verified }];
    }
    if (name) {
      $set['profile.displayName'] = name;
    }
    if (Object.keys($set).length > 0) {
      await Meteor.users.updateAsync(existingUser._id, { $set });
    }
    return { userId: existingUser._id };
  }

  const userId = await Meteor.users.insertAsync({
    createdAt: new Date(),
    services: { firebase: { uid } },
    emails: email ? [{ address: email, verified: !!decoded.email_verified }] : [],
    profile: { displayName: name || '' },
  });

  return { userId };
});
