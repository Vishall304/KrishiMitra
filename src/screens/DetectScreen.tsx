import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Clock, Image as ImageIcon, RefreshCw, Sparkles } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { fetchCropDetectionsForUser, saveCropDetection } from '../services/cropDetectionService'
import { uploadCropImage } from '../services/storageService'
import { formatFirestoreError } from '../lib/firestoreErrors'
import type { CropDetectionRecord } from '../types/models'

type Step = 'upload' | 'preview' | 'result'

const dummyAnalysis = () => ({
  cropName: 'Wheat (Triticum aestivum)',
  confidence: 94,
  description:
    'Leaves and overall canopy match wheat at tillering stage. Demo result — replace with your ML API later.',
})

export function DetectScreen() {
  const { user } = useAuth()
  const inputId = useId()
  const fileRef = useRef<HTMLInputElement>(null)
  const pickedFileRef = useRef<File | null>(null)
  const [step, setStep] = useState<Step>('upload')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultMeta, setResultMeta] = useState(dummyAnalysis())
  const [storedImageUrl, setStoredImageUrl] = useState<string | null>(null)
  const [history, setHistory] = useState<CropDetectionRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)

  const loadHistory = useCallback(async () => {
    if (!user) return
    setHistoryLoading(true)
    try {
      const rows = await fetchCropDetectionsForUser(user.uid)
      setHistory(rows)
    } catch (e) {
      if (import.meta.env.DEV) console.error('[DetectScreen] load history failed', e)
      setError(formatFirestoreError(e, 'load detection history'))
    } finally {
      setHistoryLoading(false)
    }
  }, [user])

  useEffect(() => {
    void loadHistory()
  }, [loadHistory])

  const onFile = useCallback((file: File | null) => {
    if (!file) return
    pickedFileRef.current = file
    const url = URL.createObjectURL(file)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return url
    })
    setStep('preview')
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setStep('upload')
    pickedFileRef.current = null
    setStoredImageUrl(null)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    if (fileRef.current) fileRef.current.value = ''
    setResultMeta(dummyAnalysis())
    setError(null)
  }, [])

  const analyze = async () => {
    const file = pickedFileRef.current
    if (!user || !file) {
      setError('Missing file or session.')
      return
    }
    setWorking(true)
    setError(null)
    try {
      const analysis = dummyAnalysis()
      setResultMeta(analysis)
      const imageUrl = await uploadCropImage(user.uid, file)
      setStoredImageUrl(imageUrl)
      await saveCropDetection({
        userId: user.uid,
        imageUrl,
        cropName: analysis.cropName,
        confidence: analysis.confidence,
        description: analysis.description,
      })
      await loadHistory()
      setStep('result')
    } catch (e) {
      if (import.meta.env.DEV) console.error('[DetectScreen] analyze / save failed', e)
      setError(formatFirestoreError(e, 'save detection'))
    } finally {
      setWorking(false)
    }
  }

  const previewSrc = step === 'result' && storedImageUrl ? storedImageUrl : previewUrl

  return (
    <div className="space-y-5 pb-28">
      <div className="rounded-3xl border border-green-100 bg-white p-5 shadow-md shadow-green-900/5">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-800 transition duration-200 ease-out hover:scale-105 hover:bg-green-200 hover:text-green-900">
            <Camera className="h-7 w-7" strokeWidth={2} aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Crop detection</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Upload a clear photo. Images are stored in Firebase Storage; results are saved to your account.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-2xl bg-red-50 px-4 py-2 text-sm font-medium text-red-800 ring-1 ring-red-100">{error}</p>
      )}

      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-3xl border-2 border-dashed border-green-200 bg-green-50/80 p-6 text-center shadow-inner"
          >
            <ImageIcon className="mx-auto h-14 w-14 text-green-700 transition duration-200 ease-out hover:scale-105 hover:text-green-800" strokeWidth={1.75} />
            <p className="mt-3 font-semibold text-slate-900">Upload an image</p>
            <p className="mt-1 text-sm text-slate-600">PNG or JPG from your gallery</p>
            <input
              ref={fileRef}
              id={inputId}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
            <label
              htmlFor={inputId}
              title="Choose photo or open camera"
              className="mx-auto mt-5 flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl bg-green-600 text-white shadow-lg shadow-green-900/20 transition duration-200 ease-out hover:scale-105 hover:bg-green-700 active:scale-[0.98]"
            >
              <Camera className="h-7 w-7" strokeWidth={2} aria-hidden />
              <span className="sr-only">Choose photo or camera</span>
            </label>
          </motion.div>
        )}

        {step === 'preview' && previewUrl && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="overflow-hidden rounded-3xl border border-green-100 bg-white shadow-lg"
          >
            <img src={previewUrl} alt="Crop preview" className="aspect-[4/3] w-full object-cover" />
            <div className="flex flex-wrap items-center justify-center gap-4 p-4 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => void analyze()}
                disabled={working}
                title={working ? 'Saving…' : 'Analyze and save'}
                aria-label={working ? 'Saving…' : 'Analyze and save'}
                className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600 text-white shadow-md transition duration-200 ease-out hover:scale-105 hover:bg-green-700 disabled:opacity-60 disabled:hover:scale-100 active:scale-[0.98]"
              >
                <Sparkles className="h-7 w-7" strokeWidth={2} aria-hidden />
              </button>
              <button
                type="button"
                onClick={reset}
                disabled={working}
                title="Retake photo"
                aria-label="Retake photo"
                className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-green-200 bg-white text-green-800 transition duration-200 ease-out hover:scale-105 hover:bg-green-50 active:scale-[0.98]"
              >
                <RefreshCw className="h-7 w-7" strokeWidth={2} aria-hidden />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {previewSrc && (
              <div className="overflow-hidden rounded-3xl border border-green-100 shadow-md">
                <img src={previewSrc} alt="" className="aspect-[16/9] w-full object-cover opacity-90" />
              </div>
            )}
            <div className="rounded-3xl border border-green-100 bg-white p-5 shadow-lg shadow-green-900/10">
              <div className="flex items-start gap-3">
                <span className="rounded-2xl bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-green-800">
                  Result
                </span>
                <span className="ml-auto rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-800 ring-1 ring-emerald-200">
                  {resultMeta.confidence}% match
                </span>
              </div>
              <h3 className="mt-3 text-xl font-bold text-slate-900">{resultMeta.cropName}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{resultMeta.description}</p>
              <button
                type="button"
                onClick={reset}
                title="New detection"
                aria-label="New detection"
                className="mt-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600 text-white shadow-md transition duration-200 ease-out hover:scale-105 hover:bg-green-700 active:scale-[0.98] sm:ml-0"
              >
                <RefreshCw className="h-7 w-7" strokeWidth={2} aria-hidden />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="rounded-3xl border border-green-100 bg-white p-4 shadow-md">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Clock className="h-6 w-6 text-green-600 transition duration-200 ease-out hover:scale-105 hover:text-green-700" strokeWidth={2} />
          Your detection history
        </h3>
        {historyLoading ? (
          <p className="mt-3 text-sm text-slate-500">Loading…</p>
        ) : history.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No saved detections yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {history.map((h) => (
              <li key={h.id} className="flex gap-3 rounded-2xl bg-green-50/80 p-3 ring-1 ring-green-100">
                <img src={h.imageUrl} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0 text-left">
                  <p className="font-semibold text-slate-900">{h.cropName}</p>
                  <p className="text-xs text-slate-500">{h.createdAt.toLocaleString()}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{h.description}</p>
                </div>
                <span className="shrink-0 self-start rounded-full bg-white px-2 py-0.5 text-xs font-bold text-green-800 ring-1 ring-green-200">
                  {h.confidence}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
