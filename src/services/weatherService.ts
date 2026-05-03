/**
 * Weather snapshot service.
 *
 * Today: returns deterministic mock data.
 * Tomorrow: easily switch to backend `/api/weather`
 */

export type WeatherSnapshot = {
  place: string
  tempC: number
  condition: string
  humidity: number
  rainChance: number   // ✅ ALWAYS camelCase
  source: 'mock' | 'live'
}

const DEFAULT_SNAPSHOT: WeatherSnapshot = {
  place: 'Pune Region',
  tempC: 32,
  condition: 'Partly cloudy',
  humidity: 58,
  rainChance: 30,
  source: 'mock',
}

const WEATHER_ENDPOINT =
  import.meta.env.VITE_WEATHER_ENDPOINT?.toString().trim() || ''

export async function fetchWeather(
  place = DEFAULT_SNAPSHOT.place
): Promise<WeatherSnapshot> {
  // 🔹 If no backend → return mock
  if (!WEATHER_ENDPOINT) {
    return { ...DEFAULT_SNAPSHOT, place }
  }

  try {
    const url = `${WEATHER_ENDPOINT}?place=${encodeURIComponent(place)}`
    const res = await fetch(url)

    if (!res.ok) {
      throw new Error(`Weather endpoint HTTP ${res.status}`)
    }

    const data = await res.json()

    // 🔥 IMPORTANT FIX: normalize backend → frontend
    return {
      place: String(data.place ?? place),
      tempC: Number(data.temp_c ?? data.tempC ?? DEFAULT_SNAPSHOT.tempC),
      condition: String(data.condition ?? DEFAULT_SNAPSHOT.condition),
      humidity: Number(data.humidity ?? DEFAULT_SNAPSHOT.humidity),

      // ✅ SINGLE SOURCE OF TRUTH
      rainChance: Number(
        data.rain_chance ?? data.rainChance ?? DEFAULT_SNAPSHOT.rainChance
      ),

      source: data.source === 'live' ? 'live' : 'mock',
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[KrishiMitra][weather] fallback to mock', err)
    }

    return { ...DEFAULT_SNAPSHOT, place }
  }
}