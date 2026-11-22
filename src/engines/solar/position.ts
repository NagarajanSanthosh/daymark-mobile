import * as SunCalc from 'suncalc'
import { assertCoordinates } from '@/engines/solar/coordinates'
import type { SunPosition, SunPositionInput } from '@/engines/solar/types'

const DEG_TO_RAD = Math.PI / 180

/**
 * Sun position for a place and instant.
 * Wraps SunCalc so features never import the library directly.
 *
 * SunCalc v2 emits altitude/azimuth in degrees (azimuth: north-based clockwise).
 */
export function getSunPosition(input: SunPositionInput): SunPosition {
  const { latitude, longitude, date } = input
  assertCoordinates(latitude, longitude)

  const { altitude, azimuth } = SunCalc.getPosition(date, latitude, longitude)

  return {
    altitudeDegrees: altitude,
    azimuthDegrees: ((azimuth % 360) + 360) % 360,
    altitudeRadians: altitude * DEG_TO_RAD,
    azimuthRadians: azimuth * DEG_TO_RAD,
  }
}
