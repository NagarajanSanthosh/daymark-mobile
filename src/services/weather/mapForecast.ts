import type {
  OpenMeteoForecastResponse,
  WeatherCurrent,
  WeatherHour,
  WeatherSnapshot,
} from '@/services/weather/types'

function fromUnix(seconds: number): Date {
  return new Date(seconds * 1000)
}

function findCurrentHourIndex(times: number[], currentUnix?: number): number {
  if (currentUnix != null) {
    let best = 0
    let bestDelta = Number.POSITIVE_INFINITY
    for (let i = 0; i < times.length; i += 1) {
      const delta = Math.abs(times[i] - currentUnix)
      if (delta < bestDelta) {
        bestDelta = delta
        best = i
      }
    }
    return best
  }

  const nowSec = Date.now() / 1000
  let best = 0
  let bestDelta = Number.POSITIVE_INFINITY
  for (let i = 0; i < times.length; i += 1) {
    const delta = Math.abs(times[i] - nowSec)
    if (delta < bestDelta) {
      bestDelta = delta
      best = i
    }
  }
  return best
}

export function mapOpenMeteoForecast(
  data: OpenMeteoForecastResponse,
): WeatherSnapshot {
  const times = data.hourly.time
  const hourly: WeatherHour[] = times.map((stamp, index) => ({
    time: fromUnix(stamp),
    temperatureC: data.hourly.temperature_2m[index] ?? null,
    uvIndex: data.hourly.uv_index[index] ?? null,
    cloudCoverPct: data.hourly.cloud_cover[index] ?? null,
    weatherCode: data.hourly.weather_code?.[index] ?? null,
  }))

  const currentIndex = findCurrentHourIndex(times, data.current?.time)
  const hourFallback = hourly[currentIndex]

  const current: WeatherCurrent = {
    time: data.current?.time
      ? fromUnix(data.current.time)
      : (hourFallback?.time ?? new Date()),
    temperatureC:
      data.current?.temperature_2m ?? hourFallback?.temperatureC ?? 0,
    uvIndex: data.current?.uv_index ?? hourFallback?.uvIndex ?? null,
    cloudCoverPct:
      data.current?.cloud_cover ?? hourFallback?.cloudCoverPct ?? 0,
    weatherCode:
      data.current?.weather_code ?? hourFallback?.weatherCode ?? null,
  }

  const daily =
    data.daily?.time.map((stamp, index) => ({
      date: fromUnix(stamp),
      uvIndexMax: data.daily?.uv_index_max?.[index] ?? null,
    })) ?? []

  return {
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,
    fetchedAt: new Date(),
    current,
    hourly,
    uvIndexMaxToday: daily[0]?.uvIndexMax ?? null,
    daily,
  }
}
