# Test Credentials — KrishiMitra / AgriSathi

Firebase email/password accounts usable for testing.

| Purpose | Email | Password | Status |
| --- | --- | --- | --- |
| Working test user | tester_1776759559@test.com | Password@123 | Active (created by testing agent on 2026-04-21) |
| Old fixture | krishi_1776759291@test.com | Password@123 | **Invalid** — returns 400 INVALID_LOGIN_CREDENTIALS; either deleted or password rotated. Do not use. |

> Testing agents should always sign up a fresh user per run (`tester_{timestamp}@test.com` / `Password@123`) to avoid stale-account issues. Signup flow creates Firebase Auth user + `users/{uid}` Firestore document automatically.

Firebase project: **krishix-eaccb** (configured in `/app/.env.local`, prefixed `VITE_FIREBASE_*`).

## ⚠️ Firestore Rules Required for Full Functionality

Tracker activities, reminders, and crop detections will return "Missing or insufficient permissions" until the project owner deploys the rules at `/app/firestore.rules` and `/app/storage.rules`:

```bash
# From project root, once the Firebase CLI is logged in:
firebase deploy --only firestore:rules,firestore:indexes,storage
```
