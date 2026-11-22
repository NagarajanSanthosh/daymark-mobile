import { useMemo } from 'react'
import { getSolarDayEvents, getSunPosition } from '@/engines/solar'
import type { Location } from '@/types/location'

type UseSolarDayOptions = {
  location: Location
  /** Instant for live sun position (timeline scrubber). */
  at: Date
  /** Calendar day for rise/set/noon; defaults to `at`. */
  day?: Date
}

/**
 * Feature hook: thin React wrapper around the pure solar engine.
 * No UI, no fetch — only derived solar values for a location + instant.
 */
export function useSolarDay({ location, at, day }: UseSolarDayOptions) {
  const atMs = at.getTime()
  const dayMs = (day ?? at).getTime()

  return useMemo(() => {
    const instant = new Date(atMs)
    const calendarDay = new Date(dayMs)
    const coords = {
      latitude: location.latitude,
      longitude: location.longitude,
    }

    return {
      position: getSunPosition({ ...coords, date: instant }),
      events: getSolarDayEvents({ ...coords, date: calendarDay }),
      instant,
      calendarDay,
    }
  }, [location.latitude, location.longitude, atMs, dayMs])
}
