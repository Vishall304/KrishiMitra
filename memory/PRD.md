# PRD — KrishiMitra / AgriSathi

## Original problem statement
> Improve and complete my EXISTING React + Firebase project called "KrishiMitra". Work on existing codebase only. Minimal UI polish. Fix auth/profile/crop-detection/AI-assistant/tracker/reminders. Integrate a secure AI (key not exposed to frontend), smart fallback if unavailable. Prepare for Vercel deployment.

## Tech stack
- **Vite 8** + React 19 + TypeScript (frontend)
- Firebase (Auth, Firestore, Storage) — project `krishix-eaccb`
- Tailwind CSS v4 + DM Sans typography
- lucide-react icons + framer-motion micro-interactions
- React Router v7
- **Backend**: FastAPI (`/app/backend/server.py`) — minimal, AI-focused
- **Vercel**: Python serverless mirror at `/app/api/chat.py`

## Project layout
```
/app
├── src/                          # Vite React app
│   ├── screens/                  # Home, Detect, AI, Tracker, Profile, auth/*
│   ├── services/                 # Firebase + aiService + weatherService
│   ├── components/layout/        # BottomNav (icon-only), TopNav
│   ├── context/AuthContext.tsx
│   └── routes/ProtectedRoute.tsx
├── backend/
│   ├── server.py                 # FastAPI /api/ai/chat + /api/weather
│   └── .env                      # EMERGENT_LLM_KEY, AI_MODEL
├── api/                          # Vercel serverless python mirror
│   ├── chat.py
│   └── requirements.txt          # includes --extra-index-url for emergentintegrations
├── frontend/package.json         # thin shim: cd .. && yarn dev (matches supervisor)
├── firestore.rules
├── storage.rules
├── firestore.indexes.json
├── firebase.json
└── vercel.json                   # build + rewrite /api/ai/chat → /api/chat
```

## User personas
- **Farmer (primary)** — needs daily activity logging, reminders, crop ID, and AI advice in their preferred language. Mobile-first, low-literacy-friendly.

## Core requirements (static)
- Email/password auth with persistent session
- Bottom nav: **icons only**, 5 tabs (Home, Detect, AI, Tracker, Profile)
- No emojis — only lucide-react SVGs
- Per-user data isolation (`userId` filter on every query + server-side Firestore rules)
- Secure AI — API key server-side only
- Hindi / Marathi / English AI replies
- Graceful fallback when AI provider is unreachable

<<<<<<< HEAD
## What's been implemented (as of 2026-04-24)
=======
## What's been implemented (as of 2026-04-21)
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3

### Iteration 1 — Wire-up & audit
- Cloned repo into `/app`, bridged Vite to supervisor via `/app/frontend/package.json` shim (port 3000).
- Fixed `README.md` merge-conflict markers; authored proper README.
- Vite config: `0.0.0.0:3000`, `allowedHosts: true`, `wss` HMR for preview tunnel.
- TypeScript compiles clean (`yarn tsc --noEmit`).
- Verified all screens already meet the "no emojis / lucide icons / icon-only bottom nav" spec.
- Added `data-testid` on primary auth + nav buttons.
- Friendly `formatFirestoreError` wrapper wired into Tracker + Detect screens.
- Authored `firestore.rules`, `storage.rules`, `firestore.indexes.json`, `firebase.json` for one-shot Firebase deploy.

### Iteration 2 — Secure AI integration
- **Replaced the legacy 922-line `backend/server.py`** with a focused 200-line FastAPI app exposing `/api/ai/chat` (Gemini 2.5 Flash via `emergentintegrations` + Emergent Universal Key) + `/api/weather` (mock).
- Added `backend/.env` with `EMERGENT_LLM_KEY` (never exposed to client).
- Created **Vercel serverless mirror** at `/app/api/chat.py` (`BaseHTTPRequestHandler`) with same logic + CORS.
- Created `/app/api/requirements.txt` with `emergentintegrations` + its custom `--extra-index-url`.
- Created `/app/vercel.json` with Vite build + rewrite `/api/ai/chat → /api/chat` for production.
- Wrote new `src/services/aiService.ts` — calls `/api/ai/chat`, 3-language normalization, client-side fallback on network failure.
- Wrote new `src/services/weatherService.ts` — mock-first, swap to real API via `VITE_WEATHER_ENDPOINT`.
- Rewired `AIScreen.tsx` — real LLM roundtrip, typing indicator, multi-turn session context, language-aware welcome message.
- **Fixed UX bug** — `ProtectedRoute` no longer unmounts `MainShell` on profile re-fetches (only gates on first-login `initializing`). Previously caused the AI tab to snap back to Home if tapped <8s after signup.
- `yarn build` passes (Vercel-ready).
- Verified 7/7 backend pytest pass; real LLM replies in en/hi/mr on the live preview.

<<<<<<< HEAD
### Iteration 3 (polish) — Feed, voice, weather-aware AI
- **Home feed expanded** to 12 diverse dummy posts across 8 kinds: `news`, `scheme`, `tips`, `market`, `weather`, `irrigation`, `fertilizer`, `pest`. Added horizontal category filter chips and swapped nested scroll for natural page-level scroll. New `FeedItem` type + icon map with `TrendingUp / CloudRain / Droplet / Sprout / Bug` lucide icons.
- **Real voice input** via `useSpeechRecognition` hook wrapping the browser Web Speech API. Works on Chromium / Edge / most mobile browsers without any API key. Language hint follows the farmer's preferred language (`hi-IN` / `mr-IN` / `en-IN`). Idle / listening / error / unsupported states surfaced via the mic button (pill becomes red + pulses while listening). Graceful unsupported state (button disabled, helpful tooltip) — no crashes on Safari desktop.
- **Weather-aware AI**: before sending a chat message, the client prepends the current weather snapshot (`Current weather near farmer: Pune Region, 32°C, Partly cloudy, humidity 58%, rain chance 30%.`) so the LLM can give weather-sensitive advice. Verified in iteration_4 by intercepting the outgoing POST body and confirming the LLM actually references the weather in its reply.
- Verified: `yarn tsc --noEmit` exit 0, `yarn build` exit 0, iteration_4 testing pass on all new surfaces (feed filters, 12 items, 8 kinds, page scroll, voice button state, weather injection, Hindi Devanagari reply, 5-tab nav, ProtectedRoute regression hold).

### Testing status (iteration_4)
- **Backend**: 7/7 pytest pass.
- **Frontend**: 100% pass on the polish iteration — home feed, filters, voice button, weather injection, Hindi reply, no regressions.
=======
### Testing status
- **Backend (`/api/ai/chat`, `/api/`, `/api/weather`)**: 100% pytest pass.
- **Frontend**: auth + session + nav + home + AI real-LLM flow + typing indicator + multi-language all verified live.
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3

## Known blockers (external — not code)
- 🔶 **Firestore rules on project `krishix-eaccb` still deny `activities`, `reminders`, `cropDetections`, `chatHistory`** until the user runs `firebase deploy --only firestore:rules,firestore:indexes,storage`. The rules file is already authored and correct.

## Prioritized backlog
- **P0 (needs user action)** Deploy `firestore.rules` + `storage.rules` + `firestore.indexes.json` to Firebase.
- **P1** After rules deploy, re-run full QA sweep to validate Tracker/Reminder/CropDetection CRUD + profile photo upload end-to-end.
- **P1** Deploy to Vercel — set `EMERGENT_LLM_KEY` in Vercel project env.
- **P2** Real weather API (OpenWeatherMap / WeatherAPI) — swap `weatherService.ts` endpoint.
- **P2** Real crop ML (PlantVillage / Roboflow) — swap `DetectScreen.analyze` dummy call.
- **P2** Offline-first activity log via IndexedDB for flaky connectivity.
- **P2** FCM push notifications at reminder date+time.
- **P3** Full UI chrome i18n (currently labels are English; AI replies are already multilingual).

## Test credentials
See `/app/memory/test_credentials.md`.

## Architecture decisions
- **Root-level Vite app preserved**: supervisor compatibility achieved via thin shim `/app/frontend/package.json` (cd's to /app, runs Vite on 3000). Preserves the user's original repo structure.
- **Dual backend layout**: one FastAPI server for the in-cluster preview (Kubernetes ingress routes `/api/*` → backend:8001) and one Vercel Python serverless for production. Same shape/logic; frontend code is identical in both environments.
- **Server-side key**: `EMERGENT_LLM_KEY` is in `backend/.env` and needs to be set as a Vercel Project env var for production — never exposed through Vite.
- **Multilingual system prompts** ship as code constants (not LLM-interpolated) for reliability.
- **Graceful degradation**: both server-side (LLM error → local fallback reply) and client-side (network error → client mock) never show blank screens.
