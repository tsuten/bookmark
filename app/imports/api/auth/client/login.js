import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { signOut } from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from './firebase';

// Log in to Meteor using the currently signed-in Firebase user's ID token.
// Firebase sign-in (signInWithEmailAndPassword etc.) must happen first.
export async function loginWithFirebase() {
  const auth = getFirebaseAuth();
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) {
    throw new Error('You are not signed in to Firebase.');
  }

  const idToken = await firebaseUser.getIdToken();

  await new Promise((resolve, reject) => {
    Accounts.callLoginMethod({
      methodArguments: [{ firebase: { idToken } }],
      userCallback: (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      },
    });
  });
}

// Sign out from both Firebase and Meteor.
export async function logout() {
  if (isFirebaseConfigured()) {
    try {
      await signOut(getFirebaseAuth());
    } catch (error) {
      console.error('[firebase] signOut failed:', error);
    }
  }

  await new Promise((resolve, reject) => {
    Meteor.logout((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
