import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { Mic, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { fetchChatHistoryForUser, saveChatTurn } from '../services/chatHistoryService'
import { sendChatMessage } from '../services/aiService'
import type { ChatHistoryRecord } from '../types/models'
import type { ChatMessage } from '../types'

const welcomeByLanguage: Record<'en' | 'hi' | 'mr', string> = {
  en: 'Namaste! I am KrishiMitra AI. Ask about pests, fertilizer doses, sowing dates, or crop prices.',
  hi: 'नमस्ते! मैं KrishiMitra AI हूँ। कीट, खाद की मात्रा, बुवाई का समय या फसल के दामों के बारे में पूछें।',
  mr: 'नमस्कार! मी KrishiMitra AI आहे. किड, खताचे प्रमाण, पेरणी वेळा किंवा पिकाच्या दरांबद्दल विचारा.',
}

function normaliseLang(l?: string): 'en' | 'hi' | 'mr' {
  const v = (l ?? '').toLowerCase().trim()
  if (['hi', 'hindi', 'हिंदी', 'हिन्दी'].includes(v)) return 'hi'
  if (['mr', 'marathi', 'मराठी'].includes(v)) return 'mr'
  return 'en'
}

function recordsToMessages(records: ChatHistoryRecord[]): ChatMessage[] {
  const out: ChatMessage[] = []
  for (const r of records) {
    out.push({ id: `${r.id}-u`, role: 'user', lang: r.language || 'You', text: r.userMessage })
    out.push({ id: `${r.id}-a`, role: 'assistant', lang: 'English', text: r.aiResponse })
  }
  return out
}

export function AIScreen() {
  const { user, profile } = useAuth()
  const inputId = useId()
  const scrollRef = useRef<HTMLDivElement>(null)
  const langCode = normaliseLang(profile?.preferredLanguage)
  const langLabel = profile?.preferredLanguage ?? 'English'

  const welcome: ChatMessage = useMemo(
    () => ({ id: 'welcome', role: 'assistant', lang: 'KrishiMitra', text: welcomeByLanguage[langCode] }),
    [langCode],
  )

  const [messages, setMessages] = useState<ChatMessage[]>([welcome])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [text, setText] = useState('')
  const sessionIdRef = useRef<string | undefined>(undefined)

  const canSend = useMemo(() => text.trim().length > 0 && !sending, [text, sending])

  const loadHistory = useCallback(async () => {
    if (!user) return
    setHistoryLoading(true)
    try {
      const rows = await fetchChatHistoryForUser(user.uid)
      const fromDb = recordsToMessages(rows)
      setMessages(fromDb.length > 0 ? [welcome, ...fromDb] : [welcome])
    } catch (e) {
      if (import.meta.env.DEV) console.error('[AIScreen] load history', e)
      setMessages([welcome])
    } finally {
      setHistoryLoading(false)
    }
  }, [user, welcome])

  useEffect(() => {
    void loadHistory()
  }, [loadHistory])

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    })
  }, [])

  const send = useCallback(async () => {
    const t = text.trim()
    if (!t || !user || sending) return

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', lang: langLabel, text: t }
    setMessages((prev) => [...prev, userMsg])
    setText('')
    setSending(true)
    scrollToBottom()

    try {
      const lastSix = [...messages.slice(-6), userMsg].map((m) => ({
        role: m.role,
        content: m.text,
      }))
      const res = await sendChatMessage({
        message: t,
        language: langLabel,
        sessionId: sessionIdRef.current,
        history: lastSix.slice(0, -1),
      })
      sessionIdRef.current = res.sessionId

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        lang: res.source === 'llm' ? 'KrishiMitra' : 'Offline',
        text: res.reply,
      }
      setMessages((prev) => [...prev, assistantMsg])
      scrollToBottom()

      void saveChatTurn({
        userId: user.uid,
        userMessage: t,
        aiResponse: res.reply,
        language: langLabel,
      }).catch((e) => import.meta.env.DEV && console.error('[AIScreen] saveChatTurn', e))
    } finally {
      setSending(false)
    }
  }, [text, user, sending, langLabel, messages, scrollToBottom])

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col pb-28 pt-2">
      <div className="mb-3 rounded-3xl border border-green-100 bg-white px-4 py-3 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-green-700">AI assistant</p>
        <p className="text-sm text-slate-600">
          English · हिंदी · मराठी — ask any farming question. Chats are saved to your account.
        </p>
        {historyLoading && <p className="mt-1 text-xs text-slate-500">Loading your past chats…</p>}
      </div>

      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto rounded-3xl bg-[#e8f7ec] px-3 pb-28 pt-4 [-webkit-overflow-scrolling:touch]"
        role="log"
        aria-live="polite"
        data-testid="ai-chat-log"
      >
        {messages.map((m) => (
          <motion.div
            key={m.id}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={
                m.role === 'user'
                  ? 'max-w-[85%] rounded-2xl rounded-br-md bg-green-600 px-4 py-3 text-[15px] leading-relaxed text-white shadow-md'
                  : 'max-w-[90%] rounded-2xl rounded-bl-md border border-green-100 bg-white px-4 py-3 text-[15px] leading-relaxed text-slate-800 shadow-sm'
              }
            >
              <p
                className={`mb-1 text-[11px] font-semibold uppercase tracking-wide ${
                  m.role === 'user' ? 'text-white/85' : 'text-green-700'
                }`}
              >
                {m.lang}
              </p>
              <p className={`whitespace-pre-wrap ${m.role === 'user' ? 'text-white' : ''}`}>{m.text}</p>
            </div>
          </motion.div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md border border-green-100 bg-white px-4 py-3 text-slate-500 shadow-sm">
              <span className="inline-flex gap-1">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500 [animation-delay:200ms]" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500 [animation-delay:400ms]" />
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] left-0 right-0 z-30 mx-auto max-w-lg px-3">
        <div className="flex items-end gap-2 rounded-3xl border border-green-100 bg-white p-2 shadow-xl shadow-green-900/10">
          <label htmlFor={inputId} className="sr-only">
            Message
          </label>
          <textarea
            id={inputId}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void send()
              }
            }}
            placeholder="Message… / संदेश… / संदेश…"
            data-testid="ai-input"
            className="max-h-28 min-h-[48px] flex-1 resize-none rounded-2xl bg-slate-50 px-3 py-3 text-base text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-green-500"
          />
          <button
            type="button"
            title="Voice input (coming soon)"
            aria-label="Voice input (coming soon)"
            data-testid="ai-voice-btn"
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-800 transition duration-200 ease-out hover:scale-105 hover:bg-green-200 hover:text-green-900 active:scale-95"
          >
            <Mic className="h-6 w-6" strokeWidth={2} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => void send()}
            disabled={!canSend}
            title="Send message"
            aria-label="Send message"
            data-testid="ai-send-btn"
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-600 text-white shadow-md transition duration-200 ease-out hover:scale-105 hover:bg-green-700 enabled:active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:hover:scale-100"
          >
            <Send className="h-6 w-6" strokeWidth={2} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  )
}
