import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let warnedMissingConfig = false;

function getFirebaseConfig() {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (!apiKey) {
    return null;
  }

  const config: Record<string, string> = {
    apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  };

  for (const [envKey, configKey] of [
    ["VITE_FIREBASE_STORAGE_BUCKET", "storageBucket"],
    ["VITE_FIREBASE_MESSAGING_SENDER_ID", "messagingSenderId"],
    ["VITE_FIREBASE_APP_ID", "appId"],
  ] as const) {
    const value = import.meta.env[envKey];
    if (value) {
      config[configKey] = value;
    }
  }

  return config;
}

function ensureFirebaseAuth(): Auth | null {
  if (firebaseAuth) {
    return firebaseAuth;
  }

  const config = getFirebaseConfig();
  if (!config) {
    if (!warnedMissingConfig) {
      console.warn(
        "[firebase] VITE_FIREBASE_* environment variables are missing. " +
          "Firebase login is disabled. Copy .env.example to .env and fill in your Firebase config.",
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
      "Firebase is not configured. Copy .env.example to .env and set VITE_FIREBASE_* variables.",
    );
  }
  return auth;
}
