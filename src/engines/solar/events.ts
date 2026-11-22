import * as SunCalc from 'suncalc'
import { assertCoordinates } from '@/engines/solar/coordinates'
import type { SolarDayEvents, SolarDayEventsInput } from '@/engines/solar/types'

/**
 * Sunrise, sunset, and solar noon for a calendar day.
 * Missing events (polar day/night) return null instead of throwing.
 */
export function getSolarDayEvents(input: SolarDayEventsInput): SolarDayEvents {
  const { latitude, longitude, date } = input
  assertCoordinates(latitude, longitude)

  const times = SunCalc.getTimes(date, latitude, longitude)

  const sunrise = toValidDate(times.sunrise)
  const sunset = toValidDate(times.sunset)
  const solarNoon = toValidDate(times.solarNoon)

  const dayLengthMs =
    sunrise && sunset ? Math.max(0, sunset.getTime() - sunrise.getTime()) : null

  return {
    sunrise,
    sunset,
    solarNoon,
    dayLengthMs,
  }
}

function toValidDate(value: Date | null | undefined): Date | null {
  if (!value || Number.isNaN(value.getTime())) return null
  return value
}
