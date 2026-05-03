/**
 * Weather snapshot service.
 *
<<<<<<< HEAD
 * Today: returns deterministic mock data.
 * Tomorrow: easily switch to backend `/api/weather`
=======
 * Today: returns deterministic mock data (matching the previous UI constants).
 * Tomorrow: flip `fetchWeather` to call `/api/weather` or a real provider.
 *
 * The backend already exposes `/api/weather` returning the same shape, so any
 * swap here is safe and invisible to the UI.
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
 */

export type WeatherSnapshot = {
  place: string
  tempC: number
  condition: string
  humidity: number
<<<<<<< HEAD
  rainChance: number   // ✅ ALWAYS camelCase
=======
  rainChance: number
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
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

<<<<<<< HEAD
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
=======
export async function fetchWeather(place = DEFAULT_SNAPSHOT.place): Promise<WeatherSnapshot> {
  if (!WEATHER_ENDPOINT) {
    return { ...DEFAULT_SNAPSHOT, place }
  }
  try {
    const url = `${WEATHER_ENDPOINT}?place=${encodeURIComponent(place)}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Weather endpoint HTTP ${res.status}`)
    const data = await res.json()
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
    return {
      place: String(data.place ?? place),
      tempC: Number(data.temp_c ?? data.tempC ?? DEFAULT_SNAPSHOT.tempC),
      condition: String(data.condition ?? DEFAULT_SNAPSHOT.condition),
      humidity: Number(data.humidity ?? DEFAULT_SNAPSHOT.humidity),
<<<<<<< HEAD

      // ✅ SINGLE SOURCE OF TRUTH
      rainChance: Number(
        data.rain_chance ?? data.rainChance ?? DEFAULT_SNAPSHOT.rainChance
      ),

=======
      rainChance: Number(data.rain_chance ?? data.rainChance ?? DEFAULT_SNAPSHOT.rainChance),
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
      source: data.source === 'live' ? 'live' : 'mock',
    }
  } catch (err) {
    if (import.meta.env.DEV) {
<<<<<<< HEAD
      console.warn('[KrishiMitra][weather] fallback to mock', err)
    }

    return { ...DEFAULT_SNAPSHOT, place }
  }
}
=======
      console.warn('[AgriSathi][weather] falling back to mock', err)
    }
    return { ...DEFAULT_SNAPSHOT, place }
  }
}
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
