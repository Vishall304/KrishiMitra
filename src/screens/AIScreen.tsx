import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
<<<<<<< HEAD
import { Mic, MicOff, Send, Square } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { fetchChatHistoryForUser, saveChatTurn } from '../services/chatHistoryService'
import { sendChatMessage } from '../services/aiService'
import { fetchWeather, type WeatherSnapshot } from '../services/weatherService'
=======
import { Mic, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { fetchChatHistoryForUser, saveChatTurn } from '../services/chatHistoryService'
import { sendChatMessage } from '../services/aiService'
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
import type { ChatHistoryRecord } from '../types/models'
import type { ChatMessage } from '../types'

const welcomeByLanguage: Record<'en' | 'hi' | 'mr', string> = {
<<<<<<< HEAD
  en: 'Namaste! I am KrishiMitra AI. Ask about pests, fertilizer doses, sowing dates, irrigation, or mandi prices — in English, हिंदी, or मराठी.',
  hi: 'नमस्ते! मैं KrishiMitra AI हूँ। कीट, खाद की मात्रा, बुवाई का समय, सिंचाई या मंडी भाव के बारे में पूछें — हिंदी, मराठी या अंग्रेज़ी में।',
  mr: 'नमस्कार! मी KrishiMitra AI आहे. किड, खताचे प्रमाण, पेरणीची वेळ, सिंचन किंवा बाजार भावाबद्दल विचारा — मराठी, हिंदी किंवा इंग्रजीत.',
}

const voiceLangMap: Record<'en' | 'hi' | 'mr', string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
=======
  en: 'Namaste! I am KrishiMitra AI. Ask about pests, fertilizer doses, sowing dates, or crop prices.',
  hi: 'नमस्ते! मैं KrishiMitra AI हूँ। कीट, खाद की मात्रा, बुवाई का समय या फसल के दामों के बारे में पूछें।',
  mr: 'नमस्कार! मी KrishiMitra AI आहे. किड, खताचे प्रमाण, पेरणी वेळा किंवा पिकाच्या दरांबद्दल विचारा.',
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
}

function normaliseLang(l?: string): 'en' | 'hi' | 'mr' {
  const v = (l ?? '').toLowerCase().trim()
  if (['hi', 'hindi', 'हिंदी', 'हिन्दी'].includes(v)) return 'hi'
  if (['mr', 'marathi', 'मराठी'].includes(v)) return 'mr'
  return 'en'
}

<<<<<<< HEAD
function detectMessageLang(text: string, fallback: 'en' | 'hi' | 'mr'): 'en' | 'hi' | 'mr' {
  const devanagariChars = text.match(/[\u0900-\u097F]/g)?.length ?? 0
  const totalLetters = text.match(/[A-Za-z\u0900-\u097F]/g)?.length ?? 0

  if (devanagariChars > 0 && devanagariChars / Math.max(totalLetters, 1) > 0.35) {
    const marathiWords = [
      'माझ्या',
      'माझा',
      'माझी',
      'माझे',
      'मला',
      'आहे',
      'आहेत',
      'काय',
      'करू',
      'करायचं',
      'पिकाला',
      'झाडाला',
      'पाणी',
      'द्या',
      'दिसत',
      'पिवळे',
      'डाग',
      'मराठी',
      'टोमॅटो',
      'भाजीपाला',
      'शेत',
      'खत',
      'किड',
      'रोग',
    ]

    const hindiWords = [
      'मेरे',
      'मेरा',
      'मेरी',
      'मुझे',
      'है',
      'हैं',
      'क्या',
      'करूं',
      'करना',
      'फसल',
      'पौधे',
      'पानी',
      'देना',
      'दिख',
      'पीले',
      'दाग',
      'हिंदी',
      'टमाटर',
      'सब्जी',
      'खेत',
      'खाद',
      'कीट',
      'रोग',
    ]

    const mrScore = marathiWords.filter((w) => text.includes(w)).length
    const hiScore = hindiWords.filter((w) => text.includes(w)).length

    return mrScore >= hiScore ? 'mr' : 'hi'
  }

  return fallback
}

function languageLabel(code: 'en' | 'hi' | 'mr'): string {
  if (code === 'hi') return 'हिंदी'
  if (code === 'mr') return 'मराठी'
  return 'English'
}

=======
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
function recordsToMessages(records: ChatHistoryRecord[]): ChatMessage[] {
  const out: ChatMessage[] = []
  for (const r of records) {
    out.push({ id: `${r.id}-u`, role: 'user', lang: r.language || 'You', text: r.userMessage })
<<<<<<< HEAD
    out.push({ id: `${r.id}-a`, role: 'assistant', lang: 'KrishiMitra', text: r.aiResponse })
=======
    out.push({ id: `${r.id}-a`, role: 'assistant', lang: 'English', text: r.aiResponse })
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
  }
  return out
}

<<<<<<< HEAD
function weatherLine(w: WeatherSnapshot): string {
  return `Current weather near farmer: ${w.place}, ${w.tempC}°C, ${w.condition}, humidity ${w.humidity}%, rain chance ${w.rainChance}%.`
}
// function speakText(text: string, lang: 'en' | 'hi' | 'mr') {
//   if (!('speechSynthesis' in window)) return

//   window.speechSynthesis.cancel()

//   const utterance = new SpeechSynthesisUtterance(text)
//   utterance.lang = voiceLangMap[lang]
//   utterance.rate = 0.95
//   utterance.pitch = 1
//   utterance.volume = 1

//   window.speechSynthesis.speak(utterance)
// }
=======
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
export function AIScreen() {
  const { user, profile } = useAuth()
  const inputId = useId()
  const scrollRef = useRef<HTMLDivElement>(null)
  const langCode = normaliseLang(profile?.preferredLanguage)
<<<<<<< HEAD
=======
  const langLabel = profile?.preferredLanguage ?? 'English'
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3

  const welcome: ChatMessage = useMemo(
    () => ({ id: 'welcome', role: 'assistant', lang: 'KrishiMitra', text: welcomeByLanguage[langCode] }),
    [langCode],
  )

  const [messages, setMessages] = useState<ChatMessage[]>([welcome])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [sending, setSending] = useState(false)
<<<<<<< HEAD
  const [speaking, setSpeaking] = useState(false)
  const [text, setText] = useState('')
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null)
  const sessionIdRef = useRef<string | undefined>(undefined)

  const voice = useSpeechRecognition(voiceLangMap[langCode])

  const canSend = useMemo(() => text.trim().length > 0 && !sending, [text, sending])

  useEffect(() => {
    void fetchWeather().then(setWeather).catch(() => setWeather(null))
  }, [])

  useEffect(() => {
    if (!voice.transcript) return
    setText((prev) => {
      const merged = prev.trim() ? `${prev.trim()} ${voice.transcript}` : voice.transcript
      return merged.trim()
    })
  }, [voice.transcript])

  useEffect(() => {
    return () => {
     if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
     }
    }
  }, [])
=======
  const [text, setText] = useState('')
  const sessionIdRef = useRef<string | undefined>(undefined)

  const canSend = useMemo(() => text.trim().length > 0 && !sending, [text, sending])

>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
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
<<<<<<< HEAD
  const speakText = useCallback((text: string, lang: 'en' | 'hi' | 'mr') => {
  if (!('speechSynthesis' in window)) return

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = voiceLangMap[lang]
  utterance.rate = 0.95
  utterance.pitch = 1
  utterance.volume = 1

  utterance.onstart = () => setSpeaking(true)
  utterance.onend = () => setSpeaking(false)
  utterance.onerror = () => setSpeaking(false)

  window.speechSynthesis.speak(utterance)
}, [])
=======
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3

  const send = useCallback(async () => {
    const t = text.trim()
    if (!t || !user || sending) return

<<<<<<< HEAD
    const messageLang = detectMessageLang(t, langCode)

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      lang: languageLabel(messageLang),
      text: t,
    }

=======
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', lang: langLabel, text: t }
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
    setMessages((prev) => [...prev, userMsg])
    setText('')
    setSending(true)
    scrollToBottom()
<<<<<<< HEAD
    
=======

>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
    try {
      const lastSix = [...messages.slice(-6), userMsg].map((m) => ({
        role: m.role,
        content: m.text,
      }))
<<<<<<< HEAD

      const contextPrefix = weather ? `${weatherLine(weather)}\n` : ''
      const enrichedMessage = contextPrefix ? `${contextPrefix}\n${t}` : t

      const res = await sendChatMessage({
        message: enrichedMessage,
        language: messageLang,
        sessionId: sessionIdRef.current,
        history: lastSix.slice(0, -1),
      })

      sessionIdRef.current = res.sessionId
      speakText(res.reply, messageLang)
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        lang: 'KrishiMitra',
        text: res.reply,
      }

      setMessages((prev) => [...prev, assistantMsg])
      scrollToBottom()
      speakText(res.reply, messageLang)
=======
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

>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
      void saveChatTurn({
        userId: user.uid,
        userMessage: t,
        aiResponse: res.reply,
<<<<<<< HEAD
        language: messageLang,
=======
        language: langLabel,
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
      }).catch((e) => import.meta.env.DEV && console.error('[AIScreen] saveChatTurn', e))
    } finally {
      setSending(false)
    }
<<<<<<< HEAD
  }, [text, user, sending, langCode, messages, scrollToBottom, weather])

  const toggleVoice = useCallback(() => {
    if (!voice.supported) return
    if (voice.status === 'listening') {
      voice.stop()
    } else {
      voice.start({ lang: voiceLangMap[langCode] })
    }
  }, [voice, langCode])

  const micButtonClass = (() => {
    if (!voice.supported) {
      return 'bg-slate-100 text-slate-400 cursor-not-allowed'
    }
    if (voice.status === 'listening') {
      return 'bg-red-500 text-white shadow-md ring-2 ring-red-200 animate-pulse'
    }
    return 'bg-green-100 text-green-800 hover:scale-105 hover:bg-green-200 hover:text-green-900 active:scale-95'
  })()

  const MicIcon = voice.supported ? (voice.status === 'listening' ? Square : Mic) : MicOff
=======
  }, [text, user, sending, langLabel, messages, scrollToBottom])
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col pb-28 pt-2">
      <div className="mb-3 rounded-3xl border border-green-100 bg-white px-4 py-3 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-green-700">AI assistant</p>
        <p className="text-sm text-slate-600">
<<<<<<< HEAD
          English · हिंदी · मराठी — tap the mic to speak, or type your question. Chats are saved to your account.
        </p>
        {voice.error && (
          <p className="mt-2 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900 ring-1 ring-amber-100">
            {voice.error}
          </p>
        )}
=======
          English · हिंदी · मराठी — ask any farming question. Chats are saved to your account.
        </p>
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
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
<<<<<<< HEAD
          <div className="flex justify-start" data-testid="ai-typing-indicator">
=======
          <div className="flex justify-start">
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
            <div className="rounded-2xl rounded-bl-md border border-green-100 bg-white px-4 py-3 text-slate-500 shadow-sm">
              <span className="inline-flex gap-1">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500 [animation-delay:200ms]" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500 [animation-delay:400ms]" />
              </span>
            </div>
          </div>
        )}
<<<<<<< HEAD
        {speaking && (
          <div className="flex justify-start" data-testid="ai-speaking-indicator">
            <div className="rounded-2xl rounded-bl-md border border-green-100 bg-white px-4 py-2 text-sm font-medium text-green-700 shadow-sm">
              🔊 KrishiMitra बोल रहा है...
            </div>
          </div>
        )}
=======
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
      </div>

      <div className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] left-0 right-0 z-30 mx-auto max-w-lg px-3">
        <div className="flex items-end gap-2 rounded-3xl border border-green-100 bg-white p-2 shadow-xl shadow-green-900/10">
          <label htmlFor={inputId} className="sr-only">
            Message
          </label>
          <textarea
            id={inputId}
            rows={1}
<<<<<<< HEAD
            value={voice.status === 'listening' && voice.interim ? `${text} ${voice.interim}`.trim() : text}
=======
            value={text}
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void send()
              }
            }}
<<<<<<< HEAD
            placeholder={
              voice.status === 'listening'
                ? 'Listening…'
                : 'Message… / संदेश… / संदेश…'
            }
            readOnly={voice.status === 'listening'}
=======
            placeholder="Message… / संदेश… / संदेश…"
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
            data-testid="ai-input"
            className="max-h-28 min-h-[48px] flex-1 resize-none rounded-2xl bg-slate-50 px-3 py-3 text-base text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-green-500"
          />
          <button
            type="button"
<<<<<<< HEAD
            onClick={toggleVoice}
            disabled={!voice.supported}
            title={
              !voice.supported
                ? 'Voice input not supported on this browser'
                : voice.status === 'listening'
                  ? 'Stop listening'
                  : 'Speak your question'
            }
            aria-label={
              voice.status === 'listening' ? 'Stop listening' : 'Speak your question'
            }
            aria-pressed={voice.status === 'listening'}
            data-testid="ai-voice-btn"
            className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition duration-200 ease-out ${micButtonClass}`}
          >
            <MicIcon className="h-6 w-6" strokeWidth={2} aria-hidden />
=======
            title="Voice input (coming soon)"
            aria-label="Voice input (coming soon)"
            data-testid="ai-voice-btn"
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-800 transition duration-200 ease-out hover:scale-105 hover:bg-green-200 hover:text-green-900 active:scale-95"
          >
            <Mic className="h-6 w-6" strokeWidth={2} aria-hidden />
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
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
<<<<<<< HEAD
}
=======
}
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
