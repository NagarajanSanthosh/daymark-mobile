import * as SunCalc from 'suncalc'
import { assertCoordinates } from '@/engines/solar/coordinates'
import type {
  LightWindow,
  LightWindowsInput,
  TimeInterval,
} from '@/engines/daylight/types'

/**
 * Photography / twilight light windows for a calendar day.
 *
 * SunCalc naming notes:
 * - `goldenHourEnd` = end of morning golden hour
 * - `goldenHour` = start of evening golden hour
 */
export function getLightWindows(input: LightWindowsInput): LightWindow[] {
  const { latitude, longitude, date } = input
  assertCoordinates(latitude, longitude)

  const times = SunCalc.getTimes(date, latitude, longitude)

  const windows: LightWindow[] = [
    {
      id: 'astro-dawn',
      label: 'Astronomical dawn',
      period: 'morning',
      interval: interval(times.nightEnd, times.nauticalDawn),
    },
    {
      id: 'nautical-dawn',
      label: 'Nautical dawn',
      period: 'morning',
      interval: interval(times.nauticalDawn, times.dawn),
    },
    {
      id: 'civil-dawn',
      label: 'Civil dawn',
      period: 'morning',
      interval: interval(times.dawn, times.sunrise),
    },
    {
      id: 'blue-morning',
      label: 'Blue hour (morning)',
      period: 'morning',
      // Common practical band: civil dawn → sunrise
      interval: interval(times.dawn, times.sunrise),
    },
    {
      id: 'golden-morning',
      label: 'Golden hour (morning)',
      period: 'morning',
      interval: interval(times.sunrise, times.goldenHourEnd),
    },
    {
      id: 'daylight',
      label: 'Daylight',
      period: 'day',
      interval: interval(times.goldenHourEnd, times.goldenHour),
    },
    {
      id: 'golden-evening',
      label: 'Golden hour (evening)',
      period: 'evening',
      interval: interval(times.goldenHour, times.sunset),
    },
    {
      id: 'blue-evening',
      label: 'Blue hour (evening)',
      period: 'evening',
      // Common practical band: sunset → civil dusk
      interval: interval(times.sunset, times.dusk),
    },
    {
      id: 'civil-dusk',
      label: 'Civil dusk',
      period: 'evening',
      interval: interval(times.sunset, times.dusk),
    },
    {
      id: 'nautical-dusk',
      label: 'Nautical dusk',
      period: 'evening',
      interval: interval(times.dusk, times.nauticalDusk),
    },
    {
      id: 'astro-dusk',
      label: 'Astronomical dusk',
      period: 'evening',
      interval: interval(times.nauticalDusk, times.night),
    },
  ]

  return windows.filter((window) => isUsableInterval(window.interval))
}

function interval(start: Date | null | undefined, end: Date | null | undefined): TimeInterval {
  return {
    start: toValidDate(start),
    end: toValidDate(end),
  }
}

function toValidDate(value: Date | null | undefined): Date | null {
  if (!value || Number.isNaN(value.getTime())) return null
  return value
}

function isUsableInterval(value: TimeInterval): boolean {
  if (!value.start || !value.end) return false
  return value.end.getTime() > value.start.getTime()
}
