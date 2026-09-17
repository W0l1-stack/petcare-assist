# PetCare Assist Firebase setup

The application is wired for Firebase Authentication, Cloud Firestore, and Cloud Storage.

## Firebase console

1. Create or open the Firebase project.
2. Register a Web App and copy its web configuration.
3. Authentication → Sign-in method → enable Email/Password.
4. Firestore Database → create the database.
5. Storage → enable Cloud Storage. Current Firebase documentation requires the Blaze plan for Cloud Storage.
6. Apply `firestore.rules` and `storage.rules` from this repository.

## GitHub Actions secrets

Repository → Settings → Secrets and variables → Actions → New repository secret:

- `VITE_FIREBASE_API_KEY` = Firebase Web API key
- `VITE_FIREBASE_PROJECT_ID` = Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` = Firebase Storage bucket, usually `<project-id>.firebasestorage.app` for newer projects
- `VITE_API_BASE_URL` = public HTTPS URL of the deployed PetCare Assist Express/Gemini backend

The first three values are public web-app configuration, not Gemini secrets. The Gemini API key must remain on the backend as `GEMINI_API_KEY`.

## Backend

The existing Express server exposes:

- `GET /api/health`
- `POST /api/assistant`
- `POST /api/documents/analyze`

Set `GEMINI_API_KEY` on the backend and, if desired, `FRONTEND_ORIGIN=https://w0l1-stack.github.io` for a tighter CORS policy.

After adding the GitHub Actions secrets, push any commit or manually run the Pages workflow so the frontend is rebuilt with the Firebase and backend configuration.
