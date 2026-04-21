# Test Credentials — KrishiMitra / AgriSathi

Firebase email/password accounts usable for testing.

| Purpose | Email | Password | Status |
| --- | --- | --- | --- |
| Latest smoke test (AI) | noscreen_1776761508@test.com | Password@123 | Active — created 2026-04-21 iteration 3 verification |
| Previous demo user | demo_1776760831@test.com | Password@123 | Active |
| Previous tester | tester_1776759559@test.com | Password@123 | Active |

> For any test run, sign up a fresh `demo_{timestamp}@test.com / Password@123` to avoid stale-account issues. The signup flow creates both the Firebase Auth user and the `users/{uid}` Firestore document.

Firebase project: **krishix-eaccb** (keys in `/app/.env.local`, prefixed `VITE_FIREBASE_*`).

## ⚠️ Firestore Rules Must Be Deployed by the Project Owner

The `activities`, `reminders`, `cropDetections`, and even `chatHistory` collections currently deny reads/writes until the rules in `/app/firestore.rules` (and `/app/storage.rules`) are deployed:

```bash
cd /app
firebase login           # if not already logged in
firebase use krishix-eaccb
firebase deploy --only firestore:rules,firestore:indexes,storage
```

The code handles the "permission denied" state gracefully (friendly error banner, no crash), but CRUD flows will only start persisting data after this one-time deploy.

## AI Backend

- `EMERGENT_LLM_KEY` is set in `/app/backend/.env` (server-side only — never exposed to the client).
- Health check: `GET /api/` returns `{status: "ok", llm_configured: true, model: "gemini:gemini-2.5-flash"}`.
- Chat: `POST /api/ai/chat` with `{message, language, session_id, history}`.
