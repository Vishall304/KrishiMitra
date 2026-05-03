import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/**
 * Thin wrapper around the browser Web Speech API.
 *
 * - Works in Chromium-based browsers (Chrome, Edge, Samsung Internet, Brave) and most
 *   modern mobile browsers. Safari partial support via `webkitSpeechRecognition`.
 * - No API key required.
 * - Emits the accumulated transcript (final + interim) while listening.
 * - Auto-stops after ~5 seconds of silence (browser-controlled).
 */

type Status = 'idle' | 'listening' | 'error' | 'unsupported'

export type UseSpeechRecognitionResult = {
  supported: boolean
  status: Status
  transcript: string
  interim: string
  error: string | null
  start: (opts?: { lang?: string }) => void
  stop: () => void
  reset: () => void
}

// Minimal type shim for SpeechRecognition (not in lib.dom by default).
type Recognition = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onstart: (() => void) | null
  onend: (() => void) | null
  onerror: ((e: { error?: string; message?: string }) => void) | null
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean; length: number }> }) => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

function getRecognitionCtor(): (new () => Recognition) | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: new () => Recognition
    webkitSpeechRecognition?: new () => Recognition
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function useSpeechRecognition(defaultLang = 'en-IN'): UseSpeechRecognitionResult {
  const Ctor = useMemo(getRecognitionCtor, [])
  const supported = Boolean(Ctor)

  const recognitionRef = useRef<Recognition | null>(null)
  const [status, setStatus] = useState<Status>(supported ? 'idle' : 'unsupported')
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort()
      } catch {
        /* ignore */
      }
      recognitionRef.current = null
    }
  }, [])

  const start = useCallback(
    ({ lang }: { lang?: string } = {}) => {
      if (!Ctor) {
        setStatus('unsupported')
        return
      }
      try {
        recognitionRef.current?.abort()
      } catch {
        /* ignore */
      }

      const recognition = new Ctor()
      recognition.lang = lang || defaultLang
      recognition.continuous = false
      recognition.interimResults = true

      recognition.onstart = () => {
        setStatus('listening')
        setError(null)
        setTranscript('')
        setInterim('')
      }
      recognition.onend = () => {
        setStatus((s) => (s === 'listening' ? 'idle' : s))
        setInterim('')
      }
      recognition.onerror = (e) => {
        const code = e?.error ?? 'unknown'
        if (code === 'not-allowed' || code === 'service-not-allowed') {
          setError('Microphone permission is blocked. Please allow it in the browser address bar.')
        } else if (code === 'no-speech') {
          setError("Didn't catch that — tap the mic and try again.")
        } else if (code === 'audio-capture') {
          setError('No microphone detected on this device.')
        } else if (code === 'network') {
          setError('Network error during speech recognition.')
        } else {
          setError(e?.message || `Speech recognition error: ${code}`)
        }
        setStatus('error')
      }
      recognition.onresult = (ev) => {
        let finalText = ''
        let interimText = ''
        for (let i = ev.resultIndex; i < ev.results.length; i += 1) {
          const res = ev.results[i]
          if (res && typeof res[0]?.transcript === 'string') {
            if (res.isFinal) finalText += res[0].transcript
            else interimText += res[0].transcript
          }
        }
        if (finalText) setTranscript((prev) => (prev ? `${prev} ${finalText}` : finalText).trim())
        setInterim(interimText)
      }

      recognitionRef.current = recognition
      try {
        recognition.start()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not start recognition.')
        setStatus('error')
      }
    },
    [Ctor, defaultLang],
  )

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop()
    } catch {
      /* ignore */
    }
  }, [])

  const reset = useCallback(() => {
    setTranscript('')
    setInterim('')
    setError(null)
    setStatus(supported ? 'idle' : 'unsupported')
  }, [supported])

  return { supported, status, transcript, interim, error, start, stop, reset }
}
