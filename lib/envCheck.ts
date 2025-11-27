// Centralized check for required Firebase environment variables

export type FirebaseEnvKeys =
  | 'VITE_FIREBASE_API_KEY'
  | 'VITE_FIREBASE_AUTH_DOMAIN'
  | 'VITE_FIREBASE_PROJECT_ID'
  | 'VITE_FIREBASE_STORAGE_BUCKET'
  | 'VITE_FIREBASE_MESSAGING_SENDER_ID'
  | 'VITE_FIREBASE_APP_ID'
  | 'VITE_FIREBASE_MEASUREMENT_ID';

export const requiredFirebaseKeys: FirebaseEnvKeys[] = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

function readEnv(name: FirebaseEnvKeys): string | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env: any = import.meta.env;
  return env?.[name];
}

export function getMissingFirebaseEnv(): FirebaseEnvKeys[] {
  const missing: FirebaseEnvKeys[] = [];
  for (const k of requiredFirebaseKeys) {
    if (!readEnv(k)) missing.push(k);
  }
  return missing;
}

export const isFirebaseEnvOk = getMissingFirebaseEnv().length === 0;
