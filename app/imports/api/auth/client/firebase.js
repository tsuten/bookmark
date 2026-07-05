import { Meteor } from 'meteor/meteor';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Initialized from Meteor.settings.public.firebase so the client can still
// boot in development without a settings.json.
let firebaseAuth = null;

const config = Meteor.settings?.public?.firebase;

if (config && config.apiKey) {
  const app = initializeApp(config);
  firebaseAuth = getAuth(app);
} else {
  console.warn(
    '[firebase] Meteor.settings.public.firebase is missing. ' +
      'Firebase login is disabled. Start the app with `meteor run --settings settings.json` ' +
      '(see settings.example.json).'
  );
}

export function isFirebaseConfigured() {
  return firebaseAuth !== null;
}

export function getFirebaseAuth() {
  if (!firebaseAuth) {
    throw new Error(
      'Firebase is not configured. Create settings.json and start the app with `meteor run --settings settings.json`.'
    );
  }
  return firebaseAuth;
}
