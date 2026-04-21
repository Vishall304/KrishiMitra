# KrishiMitra / AgriSathi — Farmer App

Mobile-first React + Vite + Firebase app that helps farmers detect crops from photos, track daily farm activities, set reminders, chat with an AI assistant (mocked), and manage their profile.

## Tech stack

- **Vite + React 19 + TypeScript**
- **Firebase** — Auth, Firestore, Storage
- **Tailwind CSS v4** with DM Sans typography
- **lucide-react** icons, **framer-motion** micro-interactions
- **React Router v7** for routing

## Features

| Area | Description |
| --- | --- |
| Auth | Email/password sign-up and sign-in with persisted session, friendly Firebase error messages. |
| Home | Quick actions (Detect / AI / Tracker), info feed (news, schemes, tips). |
| Crop detection | Upload photo → stored in Firebase Storage → mocked ML result saved to Firestore, with history. |
| AI assistant | Multilingual chat UI (English / हिंदी / मराठी) with mocked replies and Firestore-backed history. |
| Tracker | Add / edit / delete activities, reminders per user (userId-scoped queries). |
| Profile | Editable profile, photo upload, aggregated stats (tasks, reminders). |

## Local development

```bash
# Install dependencies
yarn install

# Copy env and fill Firebase keys
cp .env.local.example .env.local  # if missing, create .env.local manually

# Start dev server
yarn dev
```

### Required environment variables (`.env.local`)

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Firebase collections

- `users/{uid}` — profile
- `cropDetections` — per-user crop photos + mocked analysis
- `activities` — per-user farm activity log
- `reminders` — per-user reminders
- `chatHistory` — per-user AI chat turns

All writes/reads are scoped by the signed-in user's `uid`. Ownership is asserted server-side via Firestore Security Rules and client-side via `assertDocOwnedByUser` for updates/deletes.

## Build

```bash
yarn build
```
