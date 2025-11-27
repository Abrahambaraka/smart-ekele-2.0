# Déploiement Firebase

Ce guide explique deux méthodes pour déployer le projet sur Firebase Hosting : via GitHub Actions (recommandé) et manuellement depuis ta machine.

## 1) GitHub Actions (recommandé)
1. Crée un service account sur Google Cloud avec le rôle `Firebase Hosting Admin`.
2. Télécharge la clé JSON et ajoute-la dans les secrets GitHub du dépôt comme `FIREBASE_SERVICE_ACCOUNT`.
3. Pousse tes changements sur `main` — le workflow `.github/workflows/firebase-hosting-deploy.yml` construira et déployera automatiquement.

## 2) Déploiement manuel (local)
- Login interactif (navigateur) :

```cmd
npm install -g firebase-tools
firebase login
npm ci
npm run build
firebase deploy --project smart-ekele --only hosting
```

- Avec token CI (non-interactif) :

```cmd
npm install -g firebase-tools
firebase login:ci
# copie la chaîne renvoyée
set FIREBASE_TOKEN=LA_CHAINE_DE_TOKEN
cd tmp_clone_remote
npm ci
npm run build
npx firebase-tools deploy --project smart-ekele --only hosting --token %FIREBASE_TOKEN%
```

Notes:
- Le dossier déployé est `dist` (configuré dans `firebase.json`).
- Préfère la méthode GitHub Actions pour les déploiements automatisés et reproductibles.

