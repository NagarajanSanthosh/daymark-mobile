import { getLightWindows } from '@/engines/daylight'
import { getSolarDayEvents } from '@/engines/solar'
import type { Location } from '@/types/location'

export type YearMetric = 'day-length' | 'golden-evening'

export type DayCell = {
  date: Date
  dayLengthMs: number | null
  goldenEveningMs: number | null
}

export type YearSeries = {
  year: number
  days: DayCell[]
  /** Days grouped by month index 0–11 */
  months: DayCell[][]
}

function windowDurationMs(start: Date | null, end: Date | null): number | null {
  if (!start || !end) return null
  return Math.max(0, end.getTime() - start.getTime())
}

/** Build a full calendar-year series for one location (pure, sync). */
export function buildYearSeries(location: Location, year: number): YearSeries {
  const days: DayCell[] = []
  const months: DayCell[][] = Array.from({ length: 12 }, () => [])

  const cursor = new Date(year, 0, 1, 12, 0, 0)
  const end = new Date(year, 11, 31, 12, 0, 0)

  while (cursor.getTime() <= end.getTime()) {
    const date = new Date(cursor)
    const events = getSolarDayEvents({
      latitude: location.latitude,
      longitude: location.longitude,
      date,
    })
    const windows = getLightWindows({
      latitude: location.latitude,
      longitude: location.longitude,
      date,
    })
    const golden = windows.find((window) => window.id === 'golden-evening')
    const cell: DayCell = {
      date,
      dayLengthMs: events.dayLengthMs,
      goldenEveningMs: windowDurationMs(
        golden?.interval.start ?? null,
        golden?.interval.end ?? null,
      ),
    }
    days.push(cell)
    months[date.getMonth()].push(cell)
    cursor.setDate(cursor.getDate() + 1)
  }

  return { year, days, months }
}

export function metricValue(cell: DayCell, metric: YearMetric): number | null {
  return metric === 'day-length' ? cell.dayLengthMs : cell.goldenEveningMs
}

export function seriesDomain(
  days: DayCell[],
  metric: YearMetric,
): { min: number; max: number } | null {
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  for (const day of days) {
    const value = metricValue(day, metric)
    if (value == null) continue
    if (value < min) min = value
    if (value > max) max = value
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null
  if (min === max) return { min: min * 0.9, max: max * 1.1 || 1 }
  return { min, max }
}

export function extremes(
  days: DayCell[],
  metric: YearMetric,
): { shortest: DayCell | null; longest: DayCell | null } {
  let shortest: DayCell | null = null
  let longest: DayCell | null = null
  for (const day of days) {
    const value = metricValue(day, metric)
    if (value == null) continue
    if (
      !shortest ||
      (metricValue(shortest, metric) != null &&
        value < (metricValue(shortest, metric) as number))
    ) {
      shortest = day
    }
    if (
      !longest ||
      (metricValue(longest, metric) != null &&
        value > (metricValue(longest, metric) as number))
    ) {
      longest = day
    }
  }
  return { shortest, longest }
}
