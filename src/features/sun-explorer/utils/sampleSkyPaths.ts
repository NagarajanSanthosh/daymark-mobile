import { projectSunToSky, skyPointsToPath, type SkyPoint } from '@/engines/geometry'
import { getMoonSky, getSunPosition } from '@/engines/solar'
import { dateOnLocalDay, getDayProgress } from '@/features/sun-explorer/utils/zonedTime'
import type { Location } from '@/types/location'

const SAMPLE_COUNT = 48

/** Samples the local day and returns projected sky points + SVG path for the sun. */
export function sampleSunPath(location: Location, dayAnchor: Date): {
  points: SkyPoint[]
  path: string
} {
  return sampleBodyPath(location, dayAnchor, 'sun')
}

/** Moon altitude along the same local-day X axis (clock progress). */
export function sampleMoonPath(location: Location, dayAnchor: Date): {
  points: SkyPoint[]
  path: string
} {
  return sampleBodyPath(location, dayAnchor, 'moon')
}

/** Solstice anchors in the same calendar year as `dayAnchor` (approx Jun 21 / Dec 21). */
export function solsticeAnchors(dayAnchor: Date): { summer: Date; winter: Date } {
  const year = dayAnchor.getFullYear()
  return {
    summer: new Date(year, 5, 21, 12, 0, 0),
    winter: new Date(year, 11, 21, 12, 0, 0),
  }
}

function sampleBodyPath(
  location: Location,
  dayAnchor: Date,
  body: 'sun' | 'moon',
): { points: SkyPoint[]; path: string } {
  const points: SkyPoint[] = []

  for (let index = 0; index <= SAMPLE_COUNT; index += 1) {
    const localMinutes = (index / SAMPLE_COUNT) * 24 * 60
    const instant = dateOnLocalDay(dayAnchor, location.timezone, localMinutes)
    const altitudeDegrees =
      body === 'sun'
        ? getSunPosition({
            latitude: location.latitude,
            longitude: location.longitude,
            date: instant,
          }).altitudeDegrees
        : getMoonSky({
            latitude: location.latitude,
            longitude: location.longitude,
            date: instant,
          }).altitudeDegrees

    points.push(
      projectSunToSky({
        altitudeDegrees,
        dayProgress: getDayProgress(instant, location.timezone),
      }),
    )
  }

  return {
    points,
    path: skyPointsToPath(points),
  }
}
