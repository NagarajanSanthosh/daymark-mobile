/** Raw Open-Meteo forecast payload (subset we request; unixtime format). */
export type OpenMeteoForecastResponse = {
  latitude: number
  longitude: number
  timezone: string
  utc_offset_seconds: number
  current?: {
    time: number
    temperature_2m: number
    weather_code: number
    cloud_cover: number
    uv_index?: number
  }
  hourly: {
    time: number[]
    temperature_2m: (number | null)[]
    uv_index: (number | null)[]
    cloud_cover: (number | null)[]
    weather_code?: (number | null)[]
  }
  daily?: {
    time: number[]
    uv_index_max: (number | null)[]
  }
}

export type WeatherCurrent = {
  time: Date
  temperatureC: number
  uvIndex: number | null
  cloudCoverPct: number
  weatherCode: number | null
}

export type WeatherHour = {
  time: Date
  temperatureC: number | null
  uvIndex: number | null
  cloudCoverPct: number | null
  weatherCode: number | null
}

export type WeatherDaily = {
  date: Date
  uvIndexMax: number | null
}

export type WeatherSnapshot = {
  latitude: number
  longitude: number
  timezone: string
  fetchedAt: Date
  current: WeatherCurrent
  hourly: WeatherHour[]
  uvIndexMaxToday: number | null
  daily: WeatherDaily[]
}
