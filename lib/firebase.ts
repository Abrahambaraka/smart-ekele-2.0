
// Import the functions you need from the SDKs you need
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration (loaded from Vite env variables)
// Create a .env.local file and fill the variables below (see .env.example)

type FirebaseEnvKeys =
  | 'VITE_FIREBASE_API_KEY'
  | 'VITE_FIREBASE_AUTH_DOMAIN'
  | 'VITE_FIREBASE_PROJECT_ID'
  | 'VITE_FIREBASE_STORAGE_BUCKET'
  | 'VITE_FIREBASE_MESSAGING_SENDER_ID'
  | 'VITE_FIREBASE_APP_ID'
  | 'VITE_FIREBASE_MEASUREMENT_ID';

const requiredKeys: FirebaseEnvKeys[] = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

function readEnv(name: FirebaseEnvKeys): string | undefined {
  // Vite injecte les variables via import.meta.env
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env: any = import.meta.env;
  return env?.[name];
}

const missing: string[] = [];
for (const k of requiredKeys) {
  const v = readEnv(k);
  if (!v) missing.push(k);
}

if (missing.length) {
  // Message clair en dev pour éviter l'écran blanc
  // Conseils: vérifier le nom du fichier, le préfixe VITE_, et redémarrer Vite
  console.error(
    `Configuration Firebase manquante dans .env.local: ${missing.join(", ")}.\n` +
      `Assurez-vous d'avoir créé .env.local à la racine, rempli les valeurs correctes depuis la console Firebase, ` +
      `et redémarré le serveur (npm run dev).`
  );
  throw new Error(`Variables d'environnement Firebase manquantes: ${missing.join(", ")}`);
}

const firebaseConfig = {
  apiKey: readEnv('VITE_FIREBASE_API_KEY'),
  authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: readEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: readEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: readEnv('VITE_FIREBASE_APP_ID'),
  measurementId: readEnv('VITE_FIREBASE_MEASUREMENT_ID'),
};

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

// Initialize Firebase enrobé d'un try/catch pour expliquer les erreurs courantes
let app: FirebaseApp;
try {
  app = initializeApp(firebaseConfig);
} catch (e: any) {
  console.error('Échec de l\'initialisation Firebase:', e?.message || e);
  console.error('Vérifiez vos variables .env.local (VITE_FIREBASE_*) et redémarrez le serveur.');
  throw e;
}

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export { app };
