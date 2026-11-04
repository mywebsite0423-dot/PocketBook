# Pocketbook deploy guide

Static site: no build step. Data is local-first (localStorage) and syncs to Firestore after Google sign-in.

## 1. Firebase (use your existing project)
1. Console > Project settings > Your apps > add a **Web app** (or reuse one). Copy its config into `public/firebase-config.js`.
2. Build > Authentication > Sign-in method > enable **Google**.
3. Build > Firestore Database > create it if missing.
4. Firestore > Rules: **add** the `match /users/{uid}` block from `firestore.rules` to your existing rules. Do not overwrite rules your other apps rely on. (`firebase deploy --only firestore:rules` replaces everything.)
5. After step 7 below, add your Cloudflare domain under Authentication > Settings > **Authorized domains**.

## 2. GitHub
```
cd pocketbook-site
git init && git add . && git commit -m "Pocketbook"
git branch -M main
git remote add origin https://github.com/YOUR_USER/pocketbook.git
git push -u origin main
```
(Create the empty repo on github.com first.)

## 3. Cloudflare (Workers Builds)
Create > Connect to Git > pick the repo. Project name must be `pocketbook` (same as `name` in `wrangler.jsonc`). Build command: empty. Deploy command: `npx wrangler deploy`. The site is served from `public/`. Every push to `main` redeploys.
Use the `*.workers.dev` URL it gives you as the Authorized domain in Firebase.

## 4. Phone
Open the `*.pages.dev` URL, sign in under More > Cloud sync, then use "Add to Home Screen".

Notes: all your data is one Firestore document per user (1 MB limit, plenty for years of entries). Last device to save wins.
