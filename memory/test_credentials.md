# Test Credentials — KrishiMitra / AgriSathi

Firebase email/password accounts created during development / testing.

| Purpose | Email | Password |
| --- | --- | --- |
| Primary test farmer | krishi_1776759291@test.com | Password@123 |

Signup flow creates a Firebase Auth user and a `users/{uid}` Firestore document containing: fullName, phone, email, village, district, state, preferredLanguage, createdAt.

Firebase project: **krishix-eaccb** (configured in `/app/.env.local`, prefixed `VITE_FIREBASE_*`).

New accounts can be created from the UI at `/signup`.
