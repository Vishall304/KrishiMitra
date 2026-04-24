# Test Credentials — KrishiMitra / AgriSathi

| Purpose | Email | Password | Status |
| --- | --- | --- | --- |
| Latest iteration-4 Hindi-profile user | polish_1777039370@test.com | Password@123 | Active (preferredLanguage = हिंदी) |
| Iteration-3 smoke | noscreen_1776761508@test.com | Password@123 | Active |
| Iteration-2 demo | demo_1776760831@test.com | Password@123 | Active |
| Iteration-2 tester | tester_1776759559@test.com | Password@123 | Active |

> **Tip for test runs**: sign up a fresh `demo_{timestamp}@test.com / Password@123` — signup creates both the Firebase Auth user and the `users/{uid}` Firestore document automatically.

Firebase project: **krishix-eaccb** (config in `/app/.env.local`, prefixed `VITE_FIREBASE_*`).

## Key UI selectors
- Signup: `#su-name`, `#su-phone`, `#su-email`, `#su-pass`, `#su-village`, `#su-district`, `#su-state`, `#su-lang`, `[data-testid=signup-submit-btn]`
- Login: `#login-email`, `#login-password`, `[data-testid=login-submit-btn]`
- Bottom nav: `[data-testid=nav-{home|detect|ai|tracker|profile}-btn]`
- Home feed filters: `[data-testid=feed-filter-{all|weather|market|scheme|tips|news|fertilizer|irrigation|pest}]`
- Home feed list: `[data-testid=feed-list]`, FAB: `[data-testid=home-ask-ai-fab]`
- AI: `[data-testid=ai-input]`, `[data-testid=ai-voice-btn]`, `[data-testid=ai-send-btn]`, `[data-testid=ai-chat-log]`

## ⚠️ Firestore Rules Deploy Required (carry-over)

Activities / reminders / crop detection history / chat history all deny until the project owner runs:

```bash
cd /app
firebase login
firebase use krishix-eaccb
firebase deploy --only firestore:rules,firestore:indexes,storage
```

Rules + indexes files are ready at `/app/firestore.rules`, `/app/storage.rules`, `/app/firestore.indexes.json`.

## AI Backend

- `EMERGENT_LLM_KEY` in `/app/backend/.env` (server-side only).
- Health check: `GET /api/` → `{status:"ok", llm_configured:true, model:"gemini:gemini-2.5-flash"}`.
- Chat: `POST /api/ai/chat` with `{message, language, session_id, history}`.
- Weather: `GET /api/weather?place=Pune Region` → mock snapshot (source=mock).
