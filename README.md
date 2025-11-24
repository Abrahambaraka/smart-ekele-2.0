<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Smart Ekele — Démarrage local et configuration Firebase

Ce dépôt contient tout le nécessaire pour exécuter l’application en local et la connecter à Firebase (Auth + Firestore).

## Prérequis
- Node.js (version LTS recommandée)
- Un projet Firebase configuré (https://console.firebase.google.com)

## Configuration Firebase
1. Dans la console Firebase, créez un projet puis une application Web (</>).
2. Activez Authentication → méthode « Email/mot de passe » (et autres providers si besoin).
3. Créez Firestore Database (mode test en dev, puis durcissez les règles pour la prod).
4. Copiez la configuration Web (apiKey, authDomain, etc.).
5. À la racine du projet, créez un fichier `.env.local` à partir de `.env.example` et remplissez les valeurs:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_FIREBASE_MEASUREMENT_ID=...
   ```

Note: Les clés Web Firebase ne sont pas secrètes au sens strict, mais appliquez des règles Firestore strictes en production.

## Lancer en local
1. Installer les dépendances:
   `npm install`
2. Démarrer:
   `npm run dev`
3. Ouvrir l’URL affichée (souvent http://localhost:5173).

## Vérifications rapides
- Auth: créez un compte dans l’UI → vérifiez dans Firebase Console → Authentication → Utilisateurs.
- Firestore: créez/éditez des données (élèves, classes, etc.) → vérifiez les collections dans Firebase Console → Firestore.

## Notes techniques
- La configuration Firebase est lue via `import.meta.env` dans `lib/firebase.ts`.
- L’application utilise le package NPM `firebase` (bundle géré par Vite). Les import maps Firebase côté `index.html` ont été retirées pour standardiser l’import.
