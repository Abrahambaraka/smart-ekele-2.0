
// Import the functions you need from the SDKs you need
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getMissingFirebaseEnv } from './envCheck';

// Lecture des variables via Vite
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const env: any = import.meta.env;
const firebaseConfig = {
  apiKey: env?.VITE_FIREBASE_API_KEY,
  authDomain: env?.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env?.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env?.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env?.VITE_FIREBASE_APP_ID,
  measurementId: env?.VITE_FIREBASE_MEASUREMENT_ID,
};

export const firebaseEnvMissing = getMissingFirebaseEnv();
export const firebaseReady = firebaseEnvMissing.length === 0;
export const firebaseErrorMessage = firebaseReady
  ? null
  : `Variables d'environnement Firebase manquantes: ${firebaseEnvMissing.join(', ')}`;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (firebaseReady) {
  // Avertissement amical sur storageBucket fréquent
  if (
    typeof firebaseConfig.storageBucket === 'string' &&
    firebaseConfig.storageBucket.includes('firebasestorage.app') &&
    !firebaseConfig.storageBucket.endsWith('.appspot.com')
  ) {
    console.warn(
      `Attention: la valeur storageBucket semble inhabituelle (${firebaseConfig.storageBucket}). ` +
        `La forme la plus courante fournie par Firebase est <project-id>.appspot.com.`
    );
  }

  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (e: any) {
    console.error('Échec de l\'initialisation Firebase:', e?.message || e);
  }
} else {
  // Message clair en dev/prod pour éviter l'écran blanc
  console.error(
    `Configuration Firebase manquante dans .env.local: ${firebaseEnvMissing.join(', ')}.\n` +
      `Assurez-vous d'avoir créé .env.local à la racine, rempli les valeurs correctes depuis la console Firebase, ` +
      `et relancé le build (npm run build) avant déploiement.`
  );
}

// Exports (peuvent être nuls si env manquant)
export { app, auth, db, storage };
