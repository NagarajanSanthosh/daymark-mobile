import type { LightWindow } from '@/engines/daylight'
import type { WeatherHour } from '@/services/weather/types'

export type ShootabilityNote = {
  headline: string
  detail: string
  tone: 'good' | 'mixed' | 'poor' | 'neutral'
}

function averageCloud(
  hours: WeatherHour[],
  start: Date,
  end: Date,
): number | null {
  const samples = hours.filter(
    (hour) =>
      hour.cloudCoverPct != null &&
      hour.time.getTime() >= start.getTime() &&
      hour.time.getTime() <= end.getTime(),
  )
  if (samples.length === 0) return null
  const sum = samples.reduce((acc, hour) => acc + (hour.cloudCoverPct ?? 0), 0)
  return sum / samples.length
}

function pickWindow(
  windows: LightWindow[],
  id: LightWindow['id'],
): LightWindow | undefined {
  return windows.find((window) => window.id === id)
}

/**
 * Lightweight guidance: cloud cover during the next golden / blue window.
 */
export function getShootabilityNote(
  windows: LightWindow[],
  hourly: WeatherHour[],
  now: Date,
): ShootabilityNote {
  const candidates: LightWindow['id'][] = [
    'golden-evening',
    'golden-morning',
    'blue-evening',
    'blue-morning',
  ]

  let target: LightWindow | undefined
  for (const id of candidates) {
    const window = pickWindow(windows, id)
    if (!window?.interval.start || !window.interval.end) continue
    if (window.interval.end.getTime() < now.getTime()) continue
    target = window
    break
  }

  if (!target?.interval.start || !target.interval.end) {
    return {
      headline: 'No upcoming golden/blue window today',
      detail: 'Check Studio for the full light schedule, or try another city.',
      tone: 'neutral',
    }
  }

  const cloud = averageCloud(hourly, target.interval.start, target.interval.end)
  const label = target.label

  if (cloud == null) {
    return {
      headline: `${label} ahead`,
      detail: 'Cloud forecast unavailable for that window — plan with the light timeline.',
      tone: 'neutral',
    }
  }

  const pct = Math.round(cloud)
  if (cloud < 35) {
    return {
      headline: `${label} looks clear`,
      detail: `About ${pct}% cloud cover across the window — strong chance of clean light.`,
      tone: 'good',
    }
  }
  if (cloud < 65) {
    return {
      headline: `${label} under broken cloud`,
      detail: `Around ${pct}% cover — usable drama, but expect patchy light.`,
      tone: 'mixed',
    }
  }
  return {
    headline: `${label} may be muted`,
    detail: `Roughly ${pct}% cloud cover — soft/flat light more likely than a classic glow.`,
    tone: 'poor',
  }
}
