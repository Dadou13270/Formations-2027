# Formations départementales 2027

React + TypeScript + Vite · Firebase (Auth + Firestore) · Netlify.

## 1. Firebase
1. Créer un projet sur console.firebase.google.com.
2. **Authentication** → Sign-in method : activer **E-mail/Mot de passe** et **Google**.
3. **Authentication → Settings → Authorized domains** : ajouter le domaine Netlify (`xxx.netlify.app`).
4. **Firestore Database** → créer la base, puis onglet **Rules** : coller le contenu de `firestore.rules` → Publier.
5. **Project settings → Your apps → Web** : copier la config.

## 2. Local
```
cp .env.example .env   # renseigner les VITE_FIREBASE_*
npm install
npm run dev
```

## 3. Premier administrateur
Créer un compte via l'appli, puis dans Firestore → `users/{uid}` → champ `role` : `agent` → `admin`.
Ensuite les admins peuvent promouvoir d'autres utilisateurs depuis « Utilisateurs inscrits ».

## 4. Netlify
- Repo Git → Netlify « Import project » (build `npm run build`, publish `dist`, déjà dans `netlify.toml`).
- Site settings → Environment variables : ajouter les 6 `VITE_FIREBASE_*`.
- Redéployer.

## Collections Firestore
- `users/{uid}` : nom, prénom, matricule, email, role (`agent`|`admin`)
- `inscriptions/{id}` : userId, userName, formationCode (`FOR-27-…`), dateDebut, dateFin, lieu, motivations, statut (`en_attente`|`non_retenu`|`retenu`), inscriptionO2, convocationEnvoyee

Les mises à jour admin sont diffusées en temps réel (`onSnapshot`) vers « Suivi de mes formations ».
