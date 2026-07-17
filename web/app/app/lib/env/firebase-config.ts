export type FirebasePublicConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
};

export type FirebaseEnvSource = {
  VITE_FIREBASE_API_KEY?: string;
  VITE_FIREBASE_AUTH_DOMAIN?: string;
  VITE_FIREBASE_PROJECT_ID?: string;
  VITE_FIREBASE_STORAGE_BUCKET?: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  VITE_FIREBASE_APP_ID?: string;
};

export function getFirebaseConfigFromEnv(
  env: FirebaseEnvSource,
): FirebasePublicConfig | null {
  const apiKey = env.VITE_FIREBASE_API_KEY;
  if (!apiKey) {
    return null;
  }

  const config: FirebasePublicConfig = {
    apiKey,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: env.VITE_FIREBASE_PROJECT_ID ?? "",
  };

  if (env.VITE_FIREBASE_STORAGE_BUCKET) {
    config.storageBucket = env.VITE_FIREBASE_STORAGE_BUCKET;
  }
  if (env.VITE_FIREBASE_MESSAGING_SENDER_ID) {
    config.messagingSenderId = env.VITE_FIREBASE_MESSAGING_SENDER_ID;
  }
  if (env.VITE_FIREBASE_APP_ID) {
    config.appId = env.VITE_FIREBASE_APP_ID;
  }

  return config;
}

export function resolveFirebaseConfig(
  cloudflare?: { env: FirebaseEnvSource } | null,
): FirebasePublicConfig | null {
  if (cloudflare?.env.VITE_FIREBASE_API_KEY) {
    return getFirebaseConfigFromEnv(cloudflare.env);
  }

  if (import.meta.env.DEV) {
    return getFirebaseConfigFromEnv({
      VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
      VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      VITE_FIREBASE_MESSAGING_SENDER_ID:
        import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
    });
  }

  return null;
}
