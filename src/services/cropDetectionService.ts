import {
  addDoc,
  collection,
  orderBy,
  query,
  serverTimestamp,
  where,
  getDocs,
  type Timestamp,
} from 'firebase/firestore'
import { getFirestoreDb } from '../firebase/config'
import { firestoreDevLog } from '../lib/firestoreDevLog'
import { CROP_DETECTIONS } from '../firebase/collections'
import type { CropDetectionRecord } from '../types/models'
import { tsToDate } from '../types/models'

export async function saveCropDetection(input: {
  userId: string
  imageUrl: string
  cropName: string
  confidence: number
  description: string
}): Promise<string> {
  try {
    const col = collection(getFirestoreDb(), CROP_DETECTIONS)
    const docRef = await addDoc(col, {
      userId: input.userId,
      imageUrl: input.imageUrl,
      cropName: input.cropName,
      confidence: input.confidence,
      description: input.description,
      createdAt: serverTimestamp(),
    })
    firestoreDevLog.ok(CROP_DETECTIONS, 'save', { id: docRef.id, userId: input.userId })
    return docRef.id
  } catch (e) {
    firestoreDevLog.fail(CROP_DETECTIONS, 'save', e)
    throw e
  }
}

export async function fetchCropDetectionsForUser(userId: string): Promise<CropDetectionRecord[]> {
  try {
    const col = collection(getFirestoreDb(), CROP_DETECTIONS)
    const q = query(col, where('userId', '==', userId), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    const rows = snap.docs.map((d) => {
      const data = d.data() as Record<string, unknown>
      return {
        id: d.id,
        userId: String(data.userId ?? ''),
        imageUrl: String(data.imageUrl ?? ''),
        cropName: String(data.cropName ?? ''),
        confidence: Number(data.confidence ?? 0),
        description: String(data.description ?? ''),
        createdAt: tsToDate(data.createdAt as Timestamp | undefined),
      }
    })
    firestoreDevLog.ok(CROP_DETECTIONS, 'fetch', { userId, count: rows.length })
    return rows
  } catch (e) {
    firestoreDevLog.fail(CROP_DETECTIONS, 'fetch', e)
    throw e
  }
}
