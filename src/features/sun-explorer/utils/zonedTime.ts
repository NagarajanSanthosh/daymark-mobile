export type ZonedDateTimeParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

/** Reads calendar/clock parts of an instant in an IANA timezone. */
export function getZonedParts(date: Date, timeZone: string): ZonedDateTimeParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })

  const parts = formatter.formatToParts(date)
  const map = Object.fromEntries(
    parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]),
  )

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
  }
}

/** Minutes from local midnight (0–1439.99…). */
export function getLocalMinutes(date: Date, timeZone: string): number {
  const parts = getZonedParts(date, timeZone)
  return parts.hour * 60 + parts.minute + parts.second / 60
}

/** Local day progress from 0 (midnight) to 1 (next midnight). */
export function getDayProgress(date: Date, timeZone: string): number {
  return getLocalMinutes(date, timeZone) / (24 * 60)
}

/**
 * Builds a UTC Date for a wall-clock time on a given local calendar day
 * in `timeZone` (binary search over UTC).
 */
export function zonedWallTimeToUtc(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second = 0,
): Date {
  const targetDay = year * 10_000 + month * 100 + day
  const targetSeconds = hour * 3600 + minute * 60 + second

  let lo = Date.UTC(year, month - 1, day) - 14 * 3_600_000
  let hi = Date.UTC(year, month - 1, day) + 38 * 3_600_000

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    const parts = getZonedParts(new Date(mid), timeZone)
    const dayKey = parts.year * 10_000 + parts.month * 100 + parts.day
    const seconds = parts.hour * 3600 + parts.minute * 60 + parts.second

    if (dayKey < targetDay || (dayKey === targetDay && seconds < targetSeconds)) {
      lo = mid + 1
    } else {
      hi = mid
    }
  }

  return new Date(lo)
}

/** Local calendar day of `date` in `timeZone`, at the given local minutes. */
export function dateOnLocalDay(
  date: Date,
  timeZone: string,
  localMinutes: number,
): Date {
  const parts = getZonedParts(date, timeZone)
  const clamped = Math.min(24 * 60 - 0.001, Math.max(0, localMinutes))
  const hour = Math.floor(clamped / 60)
  const minute = Math.floor(clamped % 60)
  const second = Math.floor((clamped % 1) * 60)

  return zonedWallTimeToUtc(
    timeZone,
    parts.year,
    parts.month,
    parts.day,
    hour,
    minute,
    second,
  )
}

/** Snapshot "now" mapped onto the same local calendar day as `dayAnchor`. */
export function nowOnLocalDay(dayAnchor: Date, timeZone: string, now = new Date()): Date {
  return dateOnLocalDay(dayAnchor, timeZone, getLocalMinutes(now, timeZone))
}
