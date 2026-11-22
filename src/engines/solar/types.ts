export type GeoCoordinates = {
  latitude: number
  longitude: number
}

export type SunPositionInput = GeoCoordinates & {
  date: Date
}

export type SunPosition = {
  /** Degrees above horizon. Negative = below horizon. */
  altitudeDegrees: number
  /**
   * Compass bearing in degrees from true north, clockwise.
   * 0 = N, 90 = E, 180 = S, 270 = W.
   */
  azimuthDegrees: number
  /** Altitude in radians (derived from degrees). */
  altitudeRadians: number
  /** Azimuth in radians (derived from north-based degrees). */
  azimuthRadians: number
}

export type SolarDayEventsInput = GeoCoordinates & {
  /** Calendar day used for rise/set/noon (local meaning is up to the caller). */
  date: Date
}

export type SolarDayEvents = {
  sunrise: Date | null
  sunset: Date | null
  solarNoon: Date | null
  /** Milliseconds between sunrise and sunset when both exist. */
  dayLengthMs: number | null
}
