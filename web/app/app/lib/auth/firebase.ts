import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import type { FirebasePublicConfig } from "~/lib/env/firebase-config";

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let runtimeConfig: FirebasePublicConfig | null = null;
let warnedMissingConfig = false;

export function configureFirebase(config: FirebasePublicConfig | null) {
  runtimeConfig = config;
  firebaseApp = null;
  firebaseAuth = null;
  warnedMissingConfig = false;
}

function getFirebaseConfig(): FirebasePublicConfig | null {
  return runtimeConfig;
}

function ensureFirebaseAuth(): Auth | null {
  if (firebaseAuth) {
    return firebaseAuth;
  }

  const config = getFirebaseConfig();
  if (!config) {
    if (!warnedMissingConfig) {
      console.warn(
        "[firebase] Firebase config is missing. " +
          "In development, set VITE_FIREBASE_* in .env. " +
          "In production, set them in Cloudflare Workers environment variables.",
      );
      warnedMissingConfig = true;
    }
    return null;
  }

  firebaseApp = initializeApp(config);
  firebaseAuth = getAuth(firebaseApp);
  return firebaseAuth;
}

export function isFirebaseConfigured(): boolean {
  return getFirebaseConfig() !== null;
}

export function getFirebaseAuth(): Auth {
  const auth = ensureFirebaseAuth();
  if (!auth) {
    throw new Error(
      "Firebase is not configured. Set VITE_FIREBASE_* environment variables.",
    );
  }
  return auth;
}
