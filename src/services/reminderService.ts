import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Timestamp,
} from 'firebase/firestore'
import { getFirestoreDb } from '../firebase/config'
import { firestoreDevLog } from '../lib/firestoreDevLog'
import { REMINDERS } from '../firebase/collections'
import type { ReminderRecord } from '../types/models'
import { tsToDate } from '../types/models'
import { assertDocOwnedByUser } from './firestoreOwnership'

export async function addReminder(input: {
  userId: string
  title: string
  description: string
  reminderDate: string
  reminderTime: string
  type: string
  status: 'pending' | 'done'
}): Promise<string> {
  try {
    const col = collection(getFirestoreDb(), REMINDERS)
    const ref = await addDoc(col, {
      userId: input.userId,
      title: input.title,
      description: input.description,
      reminderDate: input.reminderDate,
      reminderTime: input.reminderTime,
      type: input.type,
      status: input.status,
      createdAt: serverTimestamp(),
    })
    firestoreDevLog.ok(REMINDERS, 'add', { id: ref.id, userId: input.userId })
    return ref.id
  } catch (e) {
    firestoreDevLog.fail(REMINDERS, 'add', e)
    throw e
  }
}

export async function fetchRemindersForUser(userId: string): Promise<ReminderRecord[]> {
  try {
    const col = collection(getFirestoreDb(), REMINDERS)
    const q = query(col, where('userId', '==', userId), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    const rows = snap.docs.map((d) => {
      const data = d.data() as Record<string, unknown>
      const status: 'done' | 'pending' = data.status === 'done' ? 'done' : 'pending'
      return {
        id: d.id,
        userId: String(data.userId ?? ''),
        title: String(data.title ?? ''),
        description: String(data.description ?? ''),
        reminderDate: String(data.reminderDate ?? ''),
        reminderTime: String(data.reminderTime ?? ''),
        type: String(data.type ?? ''),
        status,
        createdAt: tsToDate(data.createdAt as Timestamp | undefined),
      }
    })
    firestoreDevLog.ok(REMINDERS, 'fetch', { userId, count: rows.length })
    return rows
  } catch (e) {
    firestoreDevLog.fail(REMINDERS, 'fetch', e)
    throw e
  }
}

export async function updateReminder(
  userId: string,
  id: string,
  data: Partial<
    Pick<
      ReminderRecord,
      'title' | 'description' | 'reminderDate' | 'reminderTime' | 'type' | 'status'
    >
  >,
): Promise<void> {
  try {
    await assertDocOwnedByUser(REMINDERS, id, userId)
    const cleaned = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined),
    ) as Record<string, string>
    await updateDoc(doc(getFirestoreDb(), REMINDERS, id), cleaned)
    firestoreDevLog.ok(REMINDERS, 'update', { id, userId })
  } catch (e) {
    firestoreDevLog.fail(REMINDERS, 'update', e)
    throw e
  }
}

export async function deleteReminder(userId: string, id: string): Promise<void> {
  try {
    await assertDocOwnedByUser(REMINDERS, id, userId)
    await deleteDoc(doc(getFirestoreDb(), REMINDERS, id))
    firestoreDevLog.ok(REMINDERS, 'delete', { id, userId })
  } catch (e) {
    firestoreDevLog.fail(REMINDERS, 'delete', e)
    throw e
  }
}
