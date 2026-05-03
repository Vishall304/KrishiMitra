import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { analyzeCropImage, type DiseaseResult } from '../services/diseaseService'

type Step = 'upload' | 'preview' | 'result'

function normaliseLang(l?: string): 'en' | 'hi' | 'mr' {
  const v = (l ?? '').toLowerCase().trim()
  if (['hi', 'hindi', 'हिंदी', 'हिन्दी'].includes(v)) return 'hi'
  if (['mr', 'marathi', 'मराठी'].includes(v)) return 'mr'
  return 'en'
}

const voiceLangMap: Record<'en' | 'hi' | 'mr', string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
}

// 🧠 Smart Advice Engine
function generateSmartAdvice(disease: string, rainChance: number) {
  let advice = ''

  if (rainChance > 60) {
    advice += 'Heavy rain expected. Avoid spraying. Improve drainage. '
  } else if (rainChance > 30) {
    advice += 'Moderate rain possible. Spray carefully. '
  } else {
    advice += 'Dry weather. Safe for spraying. '
  }

  if (disease.toLowerCase().includes('fungus')) {
    advice += 'Use fungicide and reduce moisture. '
  }

  if (disease.toLowerCase().includes('pest')) {
    advice += 'Use neem oil or pesticide spray. '
  }

  if (disease.toLowerCase().includes('nutrient')) {
    advice += 'Apply balanced fertilizer (NPK). '
  }

  return advice
}

export function DetectScreen() {
  const { profile } = useAuth()
  const inputId = useId()
  const fileRef = useRef<HTMLInputElement>(null)
  const pickedFileRef = useRef<File | null>(null)

  const [step, setStep] = useState<Step>('upload')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [working, setWorking] = useState(false)
  const [result, setResult] = useState<DiseaseResult | null>(null)
  const [weather, setWeather] = useState<any>(null)
  const [location, setLocation] = useState<any>(null)
  const [advice, setAdvice] = useState('')
  const [speaking, setSpeaking] = useState(false)

  const langCode = normaliseLang(profile?.preferredLanguage)

  // 📍 GPS
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        })
      },
      () => console.log('Location denied')
    )
  }, [])

  // 🔊 Voice
  const speakText = useCallback((text: string, lang: 'en' | 'hi' | 'mr') => {
    if (!('speechSynthesis' in window)) return

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = voiceLangMap[lang]
    utterance.rate = 0.95

    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [])

  // 🌦️ Live Weather
  const fetchWeather = async () => {
    if (!location) return null

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current_weather=true`
    const res = await fetch(url)
    const data = await res.json()

    return {
      tempC: data.current_weather.temperature,
      rainChance: data.current_weather.precipitation ?? 0,
      condition: 'Live Weather',
    }
  }

  const onFile = (file: File | null) => {
    if (!file) return
    pickedFileRef.current = file
    setPreviewUrl(URL.createObjectURL(file))
    setStep('preview')
  }

  const reset = () => {
    setStep('upload')
    pickedFileRef.current = null
    setPreviewUrl(null)
    setResult(null)
  }

  const analyze = async () => {
    const file = pickedFileRef.current
    if (!file) return

    setWorking(true)

    try {
      // 🤖 AI
      const aiResult = await analyzeCropImage({
        file,
        language: langCode,
      })

      // 🌦️ Weather
      const weatherData = await fetchWeather()

      const rainChance = weatherData?.rainChance ?? 0

      // 🧠 Advice
      const smartAdvice = generateSmartAdvice(aiResult.disease, rainChance)

      setResult(aiResult)
      setWeather(weatherData)
      setAdvice(smartAdvice)

      // 🔊 Voice message
      const voiceMsg =
        langCode === 'hi'
          ? `फसल ${aiResult.crop}. समस्या ${aiResult.disease}. सलाह ${smartAdvice}`
          : langCode === 'mr'
          ? `पीक ${aiResult.crop}. समस्या ${aiResult.disease}. सल्ला ${smartAdvice}`
          : `${aiResult.crop}. ${aiResult.disease}. ${smartAdvice}`

      speakText(voiceMsg, langCode)

      setStep('result')
    } catch (err) {
      alert('Error. Check backend.')
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="p-4 space-y-4">

      <AnimatePresence mode="wait">

        {/* Upload */}
        {step === 'upload' && (
          <motion.div key="upload" className="text-center">
            <input
              ref={fileRef}
              id={inputId}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />

            <label htmlFor={inputId} className="bg-green-600 text-white px-6 py-3 rounded-xl cursor-pointer">
              Upload Crop Image
            </label>
          </motion.div>
        )}

        {/* Preview */}
        {step === 'preview' && previewUrl && (
          <motion.div key="preview">
            <img src={previewUrl} className="rounded-xl" />

            <button
              onClick={analyze}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
            >
              {working ? 'Analyzing...' : 'Analyze'}
            </button>
          </motion.div>
        )}

        {/* Result */}
        {step === 'result' && result && (
          <motion.div key="result" className="bg-white p-4 rounded-xl shadow">

            <h2 className="text-xl font-bold">{result.crop}</h2>
            <p className="text-red-600">{result.disease}</p>
            <p>Urgency: {result.urgency}</p>

            {weather && (
              <div className="mt-3 bg-blue-50 p-3 rounded">
                <p>{weather.tempC}°C • {weather.condition}</p>
                <p>Rain: {weather.rainChance}%</p>
              </div>
            )}

            {/* 🧠 Smart Advice */}
            <div className="mt-3 bg-yellow-50 p-3 rounded">
              <p className="font-semibold">Smart Advice</p>
              <p>{advice}</p>
            </div>

            {speaking && <p className="mt-2 text-green-600">🔊 बोल रहा है...</p>}

            <button
              onClick={reset}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
            >
              New
            </button>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  )
}