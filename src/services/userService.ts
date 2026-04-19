import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Timestamp,
} from 'firebase/firestore'
import { getFirestoreDb } from '../firebase/config'
import { USERS } from '../firebase/collections'
import type { SignUpPayload, UserProfile } from '../types/models'
import { tsToDate } from '../types/models'

function profileFromDoc(uid: string, data: Record<string, unknown>): UserProfile {
  return {
    uid,
    fullName: String(data.fullName ?? ''),
    phone: String(data.phone ?? ''),
    email: String(data.email ?? ''),
    village: String(data.village ?? ''),
    district: String(data.district ?? ''),
    state: String(data.state ?? ''),
    preferredLanguage: String(data.preferredLanguage ?? ''),
    photoURL: data.photoURL ? String(data.photoURL) : undefined,
    createdAt: tsToDate(data.createdAt as Timestamp | undefined),
  }
}

/**
 * Creates `users/{uid}` in Firestore (via app Firestore from `../firebase/config`).
 * Call only after `createUserWithEmailAndPassword` succeeds.
 */
export async function createUserProfile(uid: string, payload: SignUpPayload): Promise<void> {
  const ref = doc(getFirestoreDb(), USERS, uid)
  const data = {
    uid,
    fullName: payload.fullName,
    email: payload.email,
    phone: payload.phone,
    village: payload.village,
    district: payload.district,
    state: payload.state,
    preferredLanguage: payload.preferredLanguage,
    createdAt: serverTimestamp(),
  }
  try {
    await setDoc(ref, data)
    console.info('[AgriSathi][Firestore][users] Document created', {
      path: `${USERS}/${uid}`,
      uid,
      email: payload.email,
    })
  } catch (e) {
    console.error('[AgriSathi][Firestore][users] Failed to create document', { uid, error: e })
    throw e
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(getFirestoreDb(), USERS, uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return profileFromDoc(uid, snap.data() as Record<string, unknown>)
}

export async function updateUserProfile(
  uid: string,
  data: Partial<
    Pick<
      UserProfile,
      | 'fullName'
      | 'phone'
      | 'village'
      | 'district'
      | 'state'
      | 'preferredLanguage'
      | 'photoURL'
    >
  >,
): Promise<void> {
  const ref = doc(getFirestoreDb(), USERS, uid)
  const cleaned = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined),
  ) as Record<string, string>
  await updateDoc(ref, cleaned)
}
