import * as SunCalc from 'suncalc'
import { assertCoordinates } from '@/engines/solar/coordinates'
import type { GeoCoordinates } from '@/engines/solar/types'

export type MoonSky = {
  altitudeDegrees: number
  azimuthDegrees: number
  /** Illuminated fraction 0–1. */
  fraction: number
  /** Phase 0 new → 0.5 full → 1 new. */
  phase: number
  aboveHorizon: boolean
}

type MoonSkyInput = GeoCoordinates & { date: Date }

/** Moon position + illumination for Studio night sky (degrees). */
export function getMoonSky(input: MoonSkyInput): MoonSky {
  const { latitude, longitude, date } = input
  assertCoordinates(latitude, longitude)

  const position = SunCalc.getMoonPosition(date, latitude, longitude)
  const illumination = SunCalc.getMoonIllumination(date)

  return {
    altitudeDegrees: position.altitude,
    azimuthDegrees: ((position.azimuth % 360) + 360) % 360,
    fraction: illumination.fraction,
    phase: illumination.phase,
    aboveHorizon: position.altitude > -0.5,
  }
}
