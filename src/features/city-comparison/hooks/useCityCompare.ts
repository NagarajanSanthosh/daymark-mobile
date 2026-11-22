import { useEffect, useMemo, useState } from 'react'
import { getActiveLightPhase, getLightWindows, type LightWindow } from '@/engines/daylight'
import { getSolarDayEvents, type SolarDayEvents } from '@/engines/solar'
import { SAMPLE_LOCATIONS } from '@/data/sample-locations'
import { getDayLengthDelta, type DayLengthDelta } from '@/features/city-comparison/utils/dayLengthDelta'
import {
  getEarlierGoldenEvening,
  getGoldenDurationDelta,
  toGoldenCompare,
  windowDurationMs,
  type EarlierEvening,
  type GoldenDurationDelta,
} from '@/features/city-comparison/utils/goldenDelta'
import type { Location } from '@/types/location'
import { locationEquals } from '@/utils/date'

export type CityDaySnapshot = {
  location: Location
  events: SolarDayEvents
  windows: LightWindow[]
  phaseLabel: string
  goldenMorning: LightWindow | null
  goldenEvening: LightWindow | null
  blueMorning: LightWindow | null
  blueEvening: LightWindow | null
  goldenEveningDurationMs: number | null
}

const MAX_CITIES = 4

function snapshotFor(location: Location, dayAnchor: Date, at: Date): CityDaySnapshot {
  const coords = {
    latitude: location.latitude,
    longitude: location.longitude,
    date: dayAnchor,
  }
  const windows = getLightWindows(coords)
  const byId = new Map(windows.map((window) => [window.id, window]))
  const active = getActiveLightPhase({ ...coords, at })
  const goldenEvening = byId.get('golden-evening') ?? null

  return {
    location,
    events: getSolarDayEvents(coords),
    windows,
    phaseLabel: active.label,
    goldenMorning: byId.get('golden-morning') ?? null,
    goldenEvening,
    blueMorning: byId.get('blue-morning') ?? null,
    blueEvening: byId.get('blue-evening') ?? null,
    goldenEveningDurationMs: windowDurationMs(goldenEvening),
  }
}

type UseCityCompareOptions = {
  primaryLocation: Location
  dayAnchor: Date
}

/**
 * Multi-city solar + daylight compare on a shared calendar day (trip mode).
 * City A stays synced with the app-wide place; B–D stay in local state.
 */
export function useCityCompare({
  primaryLocation,
  dayAnchor,
}: UseCityCompareOptions) {
  const [locations, setLocations] = useState<Location[]>(() => [
    primaryLocation,
    SAMPLE_LOCATIONS.find((item) => item.id !== primaryLocation.id) ??
      SAMPLE_LOCATIONS[1],
  ])

  useEffect(() => {
    setLocations((current) => {
      if (locationEquals(current[0], primaryLocation)) return current
      const next = [...current]
      next[0] = primaryLocation
      if (next[1] && locationEquals(next[1], primaryLocation)) {
        next[1] =
          SAMPLE_LOCATIONS.find((item) => item.id !== primaryLocation.id) ??
          SAMPLE_LOCATIONS[1]
      }
      return next.filter(
        (item, index, list) =>
          index === 0 || !list.slice(0, index).some((prior) => locationEquals(prior, item)),
      )
    })
  }, [primaryLocation])

  const at = dayAnchor

  const derived = useMemo(() => {
    const cities = locations.map((location) => snapshotFor(location, dayAnchor, at))

    const delta: DayLengthDelta | null =
      cities.length >= 2
        ? getDayLengthDelta(
            cities[0].events.dayLengthMs,
            cities[1].events.dayLengthMs,
            cities[0].location.name,
            cities[1].location.name,
          )
        : null

    const goldenA = cities[0] ? toGoldenCompare(cities[0].goldenEvening) : null
    const goldenB = cities[1] ? toGoldenCompare(cities[1].goldenEvening) : null

    const goldenDelta: GoldenDurationDelta | null =
      goldenA && goldenB
        ? getGoldenDurationDelta(
            goldenA.durationMs,
            goldenB.durationMs,
            cities[0].location.name,
            cities[1].location.name,
          )
        : null

    const earlierEvening: EarlierEvening | null =
      goldenA && goldenB
        ? getEarlierGoldenEvening(
            goldenA.eveningStart,
            goldenB.eveningStart,
            cities[0].location.name,
            cities[1].location.name,
          )
        : null

    return {
      cities,
      delta,
      goldenDelta,
      earlierEvening,
    }
  }, [locations, dayAnchor, at])

  function setLocationAt(index: number, location: Location) {
    setLocations((current) => {
      const next = [...current]
      next[index] = location
      return next
    })
  }

  function addCity(location: Location) {
    setLocations((current) => {
      if (current.length >= MAX_CITIES) return current
      if (current.some((item) => locationEquals(item, location))) return current
      return [...current, location]
    })
  }

  function removeCity(index: number) {
    setLocations((current) => {
      if (current.length <= 2 || index === 0) return current
      return current.filter((_, i) => i !== index)
    })
  }

  function swapFirstTwo() {
    setLocations((current) => {
      if (current.length < 2) return current
      const next = [...current]
      ;[next[0], next[1]] = [next[1], next[0]]
      return next
    })
  }

  return {
    dayAnchor,
    locations,
    setLocationAt,
    addCity,
    removeCity,
    swapFirstTwo,
    maxCities: MAX_CITIES,
    ...derived,
  }
}
