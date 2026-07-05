import { Meteor } from 'meteor/meteor';

const admin = Npm.require('firebase-admin');
const { getAuth } = Npm.require('firebase-admin/lib/auth/index.js');

// Initialized lazily from Meteor.settings so the app can still boot
// in development without a settings.json.
let adminAuth = null;

const serviceAccount = Meteor.settings.firebaseAdmin;

if (serviceAccount && serviceAccount.project_id && serviceAccount.private_key) {
  const app = admin.getApps()[0] || admin.initializeApp({
    credential: admin.cert({
      ...serviceAccount,
      private_key: serviceAccount.private_key.replace(/\\n/g, '\n'),
    }),
  });
  adminAuth = getAuth(app);
} else {
  console.warn(
    '[firebase-admin] Meteor.settings.firebaseAdmin is missing or incomplete. ' +
      'Firebase login is disabled. Start the app with `meteor run --settings settings.json` ' +
      '(see settings.example.json).'
  );
}

export function getFirebaseAdminAuth() {
  return adminAuth;
}
