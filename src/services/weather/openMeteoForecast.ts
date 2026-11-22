import { mapOpenMeteoForecast } from '@/services/weather/mapForecast'
import type { OpenMeteoForecastResponse, WeatherSnapshot } from '@/services/weather/types'

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

type ForecastInput = {
  latitude: number
  longitude: number
  timezone: string
  signal?: AbortSignal
}

/**
 * Fetch current + hourly UV / temp / cloud cover from Open-Meteo (no API key).
 */
export async function fetchWeatherForecast(
  input: ForecastInput,
): Promise<WeatherSnapshot> {
  const params = new URLSearchParams({
    latitude: String(input.latitude),
    longitude: String(input.longitude),
    timezone: input.timezone || 'auto',
    timeformat: 'unixtime',
    forecast_days: '7',
    current: 'temperature_2m,weather_code,cloud_cover,uv_index',
    hourly: 'temperature_2m,uv_index,cloud_cover,weather_code',
    daily: 'uv_index_max',
  })

  const response = await fetch(`${FORECAST_URL}?${params}`, {
    signal: input.signal,
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Weather forecast failed (${response.status})`)
  }

  const data = (await response.json()) as OpenMeteoForecastResponse
  return mapOpenMeteoForecast(data)
}
