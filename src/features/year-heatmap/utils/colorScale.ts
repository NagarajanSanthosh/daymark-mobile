import type { DayCell, YearMetric } from '@/features/year-heatmap/utils/buildYearSeries'
import { metricValue } from '@/features/year-heatmap/utils/buildYearSeries'

export const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000

type RgbStop = { t: number; r: number; g: number; b: number }

/** Cool (short of 12h) → neutral → warm (long of 12h). */
const DIVERGE_STOPS: RgbStop[] = [
  { t: 0, r: 42, g: 58, b: 112 },
  { t: 0.25, r: 88, g: 118, b: 168 },
  { t: 0.5, r: 168, g: 156, b: 148 },
  { t: 0.75, r: 232, g: 156, b: 64 },
  { t: 1, r: 255, g: 224, b: 163 },
]

/** Relative metric continuum with more mid/upper distinction. */
const RELATIVE_STOPS: RgbStop[] = [
  { t: 0, r: 26, g: 22, b: 34 },
  { t: 0.2, r: 58, g: 72, b: 128 },
  { t: 0.4, r: 109, g: 126, b: 184 },
  { t: 0.55, r: 168, g: 140, b: 150 },
  { t: 0.7, r: 220, g: 140, b: 70 },
  { t: 0.85, r: 240, g: 164, b: 58 },
  { t: 1, r: 255, g: 224, b: 163 },
]

export type HeatColorScale =
  | { mode: 'diverge-12h'; maxAbsMs: number }
  | { mode: 'percentile'; sorted: number[] }

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function sampleStops(stops: RgbStop[], t: number): string {
  const clamped = Math.min(1, Math.max(0, t))
  for (let i = 0; i < stops.length - 1; i += 1) {
    const a = stops[i]
    const b = stops[i + 1]
    if (clamped >= a.t && clamped <= b.t) {
      const local = (clamped - a.t) / (b.t - a.t || 1)
      const r = Math.round(lerp(a.r, b.r, local))
      const g = Math.round(lerp(a.g, b.g, local))
      const bch = Math.round(lerp(a.b, b.b, local))
      return `rgb(${r} ${g} ${bch})`
    }
  }
  const last = stops[stops.length - 1]
  return `rgb(${last.r} ${last.g} ${last.b})`
}

/** Max |dayLength − 12h| across the year (for diverging scale). */
export function maxDeviationFrom12h(days: DayCell[]): number {
  let maxAbs = 0
  for (const day of days) {
    if (day.dayLengthMs == null) continue
    maxAbs = Math.max(maxAbs, Math.abs(day.dayLengthMs - TWELVE_HOURS_MS))
  }
  return maxAbs > 0 ? maxAbs : 1
}

/** Sorted metric values for percentile coloring. */
export function sortedMetricValues(days: DayCell[], metric: YearMetric): number[] {
  const values: number[] = []
  for (const day of days) {
    const value = metricValue(day, metric)
    if (value != null) values.push(value)
  }
  values.sort((a, b) => a - b)
  return values
}

/** Build the active color scale for a metric + year series. */
export function buildHeatColorScale(
  days: DayCell[],
  metric: YearMetric,
): HeatColorScale {
  if (metric === 'day-length') {
    return { mode: 'diverge-12h', maxAbsMs: maxDeviationFrom12h(days) }
  }
  return { mode: 'percentile', sorted: sortedMetricValues(days, metric) }
}

/** Percentile rank in [0, 1] via binary search on sorted values. */
function percentileRank(value: number, sorted: number[]): number {
  if (sorted.length === 0) return 0.5
  if (sorted.length === 1) return 0.5

  let lo = 0
  let hi = sorted.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (sorted[mid] < value) lo = mid + 1
    else hi = mid
  }
  let right = lo
  while (right < sorted.length && sorted[right] === value) right += 1
  const left = lo
  const rank = (left + right - 1) / 2
  return rank / (sorted.length - 1)
}

/** Map a metric value into the year heatmap palette. */
export function colorForValue(
  value: number | null,
  scale: HeatColorScale | null,
): string {
  if (value == null || !scale) return 'rgba(247,241,232,0.06)'

  if (scale.mode === 'diverge-12h') {
    const signed = (value - TWELVE_HOURS_MS) / scale.maxAbsMs
    const t = Math.min(1, Math.max(0, (signed + 1) / 2))
    return sampleStops(DIVERGE_STOPS, t)
  }

  return sampleStops(RELATIVE_STOPS, percentileRank(value, scale.sorted))
}

export function legendStops(metric: YearMetric): string[] {
  if (metric === 'day-length') {
    return [0, 0.25, 0.5, 0.75, 1].map((t) => sampleStops(DIVERGE_STOPS, t))
  }
  return [0, 0.2, 0.4, 0.55, 0.7, 0.85, 1].map((t) =>
    sampleStops(RELATIVE_STOPS, t),
  )
}
