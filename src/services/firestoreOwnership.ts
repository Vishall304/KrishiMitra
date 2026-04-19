import { doc, getDoc } from 'firebase/firestore'
import { getFirestoreDb } from '../firebase/config'

/** Ensures a document exists and `userId` field matches the signed-in user. */
export async function assertDocOwnedByUser(
  collectionName: string,
  documentId: string,
  userId: string,
): Promise<void> {
  const ref = doc(getFirestoreDb(), collectionName, documentId)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    throw new Error('Document not found.')
  }
  const data = snap.data() as Record<string, unknown>
  if (String(data.userId ?? '') !== userId) {
    throw new Error('You can only change your own records.')
  }
}
