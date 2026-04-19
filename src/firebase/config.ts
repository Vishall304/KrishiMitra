import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const CONFIG_HELP =
  'Add a `.env.local` file in the project root (same folder as `package.json`) with all VITE_FIREBASE_* variables, then restart `npm run dev`.'

/** Normalize Vite env strings (trim + strip accidental wrapping quotes from .env). */
function trimEnv(value: unknown): string {
  let s = String(value ?? '').trim()
  if (s.length >= 2) {
    const q = s[0]
    if ((q === '"' || q === "'") && s[s.length - 1] === q) {
      s = s.slice(1, -1).trim()
    }
  }
  return s.replace(/^\uFEFF/, '')
}

/**
 * Read Firebase settings from Vite (`import.meta.env`).
 * Use the exact names Vite exposes after loading `.env`, `.env.local`, etc.
 */
function readFirebaseEnvFromVite() {
  return {
    apiKey: trimEnv(import.meta.env.VITE_FIREBASE_API_KEY),
    authDomain: trimEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
    projectId: trimEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID),
    storageBucket: trimEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: trimEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    appId: trimEnv(import.meta.env.VITE_FIREBASE_APP_ID),
  }
}

function envLooksComplete(env: ReturnType<typeof readFirebaseEnvFromVite>): boolean {
  return Object.values(env).every((v) => v.length > 0)
}

const env = readFirebaseEnvFromVite()
const envComplete = envLooksComplete(env)

if (import.meta.env.DEV) {
  const apiKeyHint = env.apiKey ? `loaded (${env.apiKey.length} chars)` : 'MISSING or empty'
  console.info('[AgriSathi][firebase][dev] import.meta.env Firebase keys:', {
    VITE_FIREBASE_API_KEY: apiKeyHint,
    VITE_FIREBASE_AUTH_DOMAIN: env.authDomain || 'MISSING',
    VITE_FIREBASE_PROJECT_ID: env.projectId || 'MISSING',
    VITE_FIREBASE_STORAGE_BUCKET: env.storageBucket || 'MISSING',
    VITE_FIREBASE_MESSAGING_SENDER_ID: env.messagingSenderId || 'MISSING',
    VITE_FIREBASE_APP_ID: env.appId ? 'set' : 'MISSING',
  })
}

let app: FirebaseApp | null = null
let authInstance: Auth | null = null
let dbInstance: Firestore | null = null
let storageInstance: FirebaseStorage | null = null
let firebaseReady = false

if (!envComplete) {
  console.warn(
    `[AgriSathi][firebase] Firebase environment variables are missing or empty. ${CONFIG_HELP}`,
  )
} else {
  try {
    const firebaseConfig = {
      apiKey: env.apiKey,
      authDomain: env.authDomain,
      projectId: env.projectId,
      storageBucket: env.storageBucket,
      messagingSenderId: env.messagingSenderId,
      appId: env.appId,
    }
    app = getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig)
    authInstance = getAuth(app)
    dbInstance = getFirestore(app)
    storageInstance = getStorage(app)
    firebaseReady = true
  } catch (e) {
    console.warn('[AgriSathi][firebase] initializeApp failed (invalid config or SDK error):', e)
    app = null
    authInstance = null
    dbInstance = null
    storageInstance = null
    firebaseReady = false
  }
}

if (!import.meta.env.DEV && !firebaseReady) {
  console.warn('[AgriSathi][firebase] Firebase is not initialized. Check environment configuration.')
}

export { firebaseReady }

export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    console.warn('[AgriSathi][firebase] Auth is not available.', CONFIG_HELP)
    throw new Error('Firebase Auth is not configured.')
  }
  return authInstance
}

export function getFirestoreDb(): Firestore {
  if (!dbInstance) {
    console.warn('[AgriSathi][firebase] Firestore is not available.', CONFIG_HELP)
    throw new Error('Firebase Firestore is not configured.')
  }
  return dbInstance
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storageInstance) {
    console.warn('[AgriSathi][firebase] Storage is not available.', CONFIG_HELP)
    throw new Error('Firebase Storage is not configured.')
  }
  return storageInstance
}

export { app }
