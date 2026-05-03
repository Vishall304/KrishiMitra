/**
 * Talks to the KrishiMitra backend AI endpoint (`/api/ai/chat`).
 *
 * Works in three environments without changes:
 * - Emergent preview (`/api/*` is proxied to the FastAPI server on :8001)
 * - Local Vite dev (use the Vite proxy defined in vite.config.ts)
 * - Vercel production (`/api/chat.py` serverless function)
 *
 * Falls back to a client-side mock reply if the network call itself fails.
 */

export type ChatTurn = {
  role: 'user' | 'assistant'
  content: string
}

export type ChatRequest = {
  message: string
  language?: string
  sessionId?: string
  history?: ChatTurn[]
}

export type ChatResponse = {
  reply: string
  language: 'en' | 'hi' | 'mr'
  sessionId: string
  source: 'llm' | 'fallback' | 'network-fallback'
}

const MOCK_REPLIES: Record<'en' | 'hi' | 'mr', string> = {
  en: "I can't reach the advisor right now. Quick tip: irrigate early morning, rotate crops, and keep a photo log of any pest damage to show your local KVK.",
  hi: 'अभी सलाहकार से संपर्क नहीं हो पा रहा। त्वरित सुझाव: सुबह-सुबह सिंचाई करें, फसल बदलें, और कीट नुकसान की फोटो रखें ताकि KVK को दिखा सकें।',
  mr: 'सध्या सल्लागाराशी संपर्क होत नाही. झटपट सल्ला: सकाळी लवकर पाणी द्या, पीक बदल करा, आणि किडीचे फोटो काढून KVK ला दाखवा.',
}

function normaliseLang(l?: string): 'en' | 'hi' | 'mr' {
  const v = (l ?? '').toLowerCase().trim()
  if (['hi', 'hindi', 'हिंदी', 'हिन्दी'].includes(v)) return 'hi'
  if (['mr', 'marathi', 'मराठी'].includes(v)) return 'mr'
  return 'en'
}

const AI_ENDPOINT =
  import.meta.env.VITE_AI_ENDPOINT || "http://127.0.0.1:8001/api/ai/chat";

export async function sendChatMessage(req: ChatRequest): Promise<ChatResponse> {
  const language = normaliseLang(req.language)
  try {
    const res = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: req.message,
        language,
        session_id: req.sessionId,
        history: req.history,
      }),
    })
    if (!res.ok) {
      throw new Error(`AI endpoint returned HTTP ${res.status}`)
    }
    const data = (await res.json()) as {
      reply: string
      language: 'en' | 'hi' | 'mr'
      session_id: string
      source: 'llm' | 'fallback'
    }
    return {
      reply: data.reply,
      language: data.language,
      sessionId: data.session_id,
      source: data.source,
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[KrishiMitra][ai] chat request failed, using client fallback', err)
    }
    return {
      reply: MOCK_REPLIES[language],
      language,
      sessionId: req.sessionId ?? `local-${Date.now()}`,
      source: 'network-fallback',
    }
  }
}
