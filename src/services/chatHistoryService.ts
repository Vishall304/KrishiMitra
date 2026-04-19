import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
  limit,
  type Timestamp,
} from 'firebase/firestore'
import { getFirestoreDb } from '../firebase/config'
import { CHAT_HISTORY } from '../firebase/collections'
import type { ChatHistoryRecord } from '../types/models'
import { tsToDate } from '../types/models'

const PAGE = 80

export async function saveChatTurn(input: {
  userId: string
  userMessage: string
  aiResponse: string
  language: string
}): Promise<string> {
  const col = collection(getFirestoreDb(), CHAT_HISTORY)
  const ref = await addDoc(col, {
    userId: input.userId,
    userMessage: input.userMessage,
    aiResponse: input.aiResponse,
    language: input.language,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function fetchChatHistoryForUser(userId: string): Promise<ChatHistoryRecord[]> {
  const col = collection(getFirestoreDb(), CHAT_HISTORY)
  const q = query(
    col,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(PAGE),
  )
  const snap = await getDocs(q)
  const rows = snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>
    return {
      id: d.id,
      userId: String(data.userId ?? ''),
      userMessage: String(data.userMessage ?? ''),
      aiResponse: String(data.aiResponse ?? ''),
      language: String(data.language ?? ''),
      createdAt: tsToDate(data.createdAt as Timestamp | undefined),
    }
  })
  return rows.reverse()
}
