# PRD — KrishiMitra / AgriSathi

## Original problem statement
> Improve and complete my EXISTING React + Firebase project called "KrishiMitra". Do NOT create a new project. Do NOT redesign the entire UI. Work on the existing codebase only. Make the app fully working, clean UI, bug-free, demo-ready. Minimal UI changes (no emojis → lucide icons, bottom nav icons-only, alignment/spacing, mobile responsiveness, keep layout). Fix: Auth, Profile, Crop Detection, AI Assistant (mocked), Tracker, Reminders. Firebase: all collections (users, activities, reminders, cropDetections). Storage: profile + crop image uploads. Error handling: no blank screens.

## Tech stack
- **Vite 8** + React 19 + TypeScript
- Firebase (Auth, Firestore, Storage) — project `krishix-eaccb`
- Tailwind CSS v4 + DM Sans
- lucide-react icons + framer-motion micro-interactions
- React Router v7

## Project layout
- `/app` (root) — actual Vite app (cloned from GitHub user repo)
- `/app/frontend/package.json` — thin shim that `cd ..`s to root and runs Vite on port 3000 (matches the supervisor-managed `frontend` program)
- `/app/src/...` — screens, services, context
- `/app/firestore.rules`, `/app/storage.rules`, `/app/firestore.indexes.json`, `/app/firebase.json` — deploy artifacts

## User personas
- **Farmer (primary)** — needs quick access to daily activity logging, reminders, crop identification, and AI advice in their preferred language. Mobile-first, low literacy friendly.

## Core requirements (static)
- Email/password auth with persistent session
- Bottom nav: **icons only**, 5 tabs (Home, Detect, AI, Tracker, Profile)
- No emojis anywhere — only lucide-react SVG icons
- All screens mobile-responsive, `max-w-lg` container
- Per-user data isolation (`userId` filter on every collection query, plus Firestore rules enforcing it)

## What's been implemented (2026-04-21)
- ✅ Repo cloned into `/app`, supervisor bridged via `/app/frontend/package.json` shim so `yarn start` runs Vite on 3000
- ✅ README merge-conflict markers removed and replaced with clean README
- ✅ `vite.config.ts` configured for `0.0.0.0:3000`, `allowedHosts: true`, `wss` HMR for preview tunnel
- ✅ TypeScript compiles clean (`yarn tsc --noEmit`)
- ✅ Signup → Firebase Auth + Firestore `users/{uid}` doc creation
- ✅ Login with friendly `formatAuthError` messages + session persistence
- ✅ Bottom nav: icon-only (already in repo, verified)
- ✅ Home (quick actions + feed + FAB), Detect (upload → mocked analysis → Firestore+Storage), AI (mocked replies + chatHistory), Tracker (activity + reminder CRUD), Profile (edit + photo upload)
- ✅ Data-testid added on primary auth + nav buttons for test automation
- ✅ New `formatFirestoreError` wrapper surfaces friendlier messages (incl. permission-denied)
- ✅ `firestore.rules`, `storage.rules`, `firebase.json`, `firestore.indexes.json` authored for one-shot deployment
- ✅ E2E testing run (iteration_2): auth, session, nav, home, AI chat, profile load all PASS

## Known blockers (external — not code)
- 🔶 **Firestore security rules on project `krishix-eaccb` currently deny read/write** to `activities`, `reminders`, `cropDetections` even for the owning user. User must deploy `/app/firestore.rules` (see README / test_credentials.md). Until then, Tracker CRUD, Reminder CRUD, and Crop Detection save/history will surface a friendly permission-error banner.
- 🔶 **Storage rules** same — deploy `/app/storage.rules` alongside Firestore rules.

## Prioritized backlog
- **P0 (needs user action)** Deploy `firestore.rules` + `storage.rules` to Firebase project.
- **P1** Re-run testing agent after rules deploy to validate Tracker/Reminders/Detect CRUD end-to-end.
- **P1** Switch AI assistant mock to real LLM (Gemini via Universal Key) — user said "mock for now".
- **P2** Offline-first activity log (IndexedDB cache) for flaky connectivity in fields.
- **P2** Push reminders (Firebase Cloud Messaging) at reminderDate + reminderTime.
- **P2** Real crop ML via PlantVillage / Roboflow API.
- **P3** Full i18n of UI strings (currently only input labels are bilingual; chrome is English).

## Test credentials
See `/app/memory/test_credentials.md`.

## Architecture decisions
- Kept Vite at repo root (not moved to `/app/frontend`) so the existing user codebase structure is preserved. Supervisor compatibility is achieved via a shim `package.json`.
- Firestore rules use `request.auth.uid == resource.data.userId` ownership pattern. Index file pre-defines the `(userId ASC, createdAt DESC)` composite index that matches every service query.
