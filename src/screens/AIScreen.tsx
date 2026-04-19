import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { fetchChatHistoryForUser, saveChatTurn } from '../services/chatHistoryService'
import type { ChatHistoryRecord } from '../types/models'
import type { ChatMessage } from '../types'

const welcomeMessage: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  lang: 'English',
  text: 'Namaste! I am AgriSathi AI. Ask about pests, fertilizer doses, sowing dates, or crop prices.',
}

function recordsToMessages(records: ChatHistoryRecord[]): ChatMessage[] {
  const out: ChatMessage[] = []
  for (const r of records) {
    out.push({
      id: `${r.id}-u`,
      role: 'user',
      lang: r.language || 'You',
      text: r.userMessage,
    })
    out.push({
      id: `${r.id}-a`,
      role: 'assistant',
      lang: 'English',
      text: r.aiResponse,
    })
  }
  return out
}

export function AIScreen() {
  const { user, profile } = useAuth()
  const inputId = useId()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [text, setText] = useState('')

  const canSend = useMemo(() => text.trim().length > 0, [text])

  const loadHistory = useCallback(async () => {
    if (!user) return
    setHistoryLoading(true)
    try {
      const rows = await fetchChatHistoryForUser(user.uid)
      const fromDb = recordsToMessages(rows)
      setMessages(fromDb.length > 0 ? fromDb : [welcomeMessage])
    } catch (e) {
      console.error(e)
      setMessages([welcomeMessage])
    } finally {
      setHistoryLoading(false)
    }
  }, [user])

  useEffect(() => {
    void loadHistory()
  }, [loadHistory])

  const pushAssistant = useCallback((reply: string, lang = 'English') => {
    setMessages((prev) => [
      ...prev,
      {
        id: `a-${Date.now()}`,
        role: 'assistant',
        lang,
        text: reply,
      },
    ])
  }, [])

  const send = useCallback(() => {
    const t = text.trim()
    if (!t || !user) return
    const langLabel = profile?.preferredLanguage ?? 'English'
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      lang: langLabel,
      text: t,
    }
    setMessages((prev) => [...prev, userMsg])
    setText('')
    const reply =
      'Thanks! This is a demo reply saved to your account. Connect a real model later for accurate advisories.'
    setTimeout(() => {
      pushAssistant(reply, 'English')
      void saveChatTurn({
        userId: user.uid,
        userMessage: t,
        aiResponse: reply,
        language: langLabel,
      }).catch(console.error)
    }, 450)
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    })
  }, [pushAssistant, text, user, profile?.preferredLanguage])

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col pb-28 pt-2">
      <div className="mb-3 rounded-3xl border border-green-100 bg-white px-4 py-3 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-green-700">AI assistant</p>
        <p className="text-sm text-slate-600">
          Hindi · मराठी · English — chats are saved to Firebase. Voice is a placeholder button.
        </p>
        {historyLoading && <p className="mt-1 text-xs text-slate-500">Loading your past chats…</p>}
      </div>

      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto rounded-3xl bg-[#e8f7ec] px-3 pb-28 pt-4 [-webkit-overflow-scrolling:touch]"
        role="log"
        aria-live="polite"
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
              <p className={m.role === 'user' ? 'text-white' : ''}>{m.text}</p>
            </div>
          </motion.div>
        ))}
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
                send()
              }
            }}
            placeholder="Message… / संदेश…"
            className="max-h-28 min-h-[48px] flex-1 resize-none rounded-2xl bg-slate-50 px-3 py-3 text-base text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-green-500"
          />
          <button
            type="button"
            aria-label="Voice input (demo)"
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-xl text-green-800 transition hover:bg-green-200 active:scale-95"
          >
            🎤
          </button>
          <button
            type="button"
            onClick={send}
            disabled={!canSend}
            aria-label="Send"
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-600 text-white shadow-md transition hover:bg-green-700 enabled:active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            <PaperAirplaneIcon className="h-6 w-6 -rotate-12" />
          </button>
        </div>
      </div>
    </div>
  )
}
