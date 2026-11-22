import type { ProjectSunInput, SkyPoint, SkyViewBox } from '@/engines/geometry/types'

export const DEFAULT_SKY_VIEW: SkyViewBox = {
  width: 600,
  height: 280,
  horizonY: 210,
  paddingX: 40,
  // Must stay >= sun glow radius in SunSky (keeps disc on-screen).
  safeInset: 48,
  maxAltitudeDegrees: 90,
}

/**
 * Maps solar altitude + local day progress onto SVG coordinates.
 * X follows the clock across the day; Y follows altitude above/below the horizon.
 * Coordinates are clamped so the sun disc/glow stays inside the viewBox.
 */
export function projectSunToSky(input: ProjectSunInput): SkyPoint {
  const view = { ...DEFAULT_SKY_VIEW, ...input.view }
  const progress = clamp01(input.dayProgress)
  const spanX = view.width - view.paddingX * 2
  const rawX = view.paddingX + progress * spanX
  const x = clamp(rawX, view.safeInset, view.width - view.safeInset)

  const belowHorizon = input.altitudeDegrees < 0
  const y = belowHorizon
    ? projectBelowHorizon(input.altitudeDegrees, view)
    : projectAboveHorizon(input.altitudeDegrees, view)

  return {
    x,
    y,
    belowHorizon,
  }
}

/** Builds an SVG path `d` string from projected points (open polyline). */
export function skyPointsToPath(points: SkyPoint[]): string {
  if (points.length === 0) return ''

  return points
    .map((point, index) => {
      const command = index === 0 ? 'M' : 'L'
      return `${command} ${round(point.x)} ${round(point.y)}`
    })
    .join(' ')
}

function projectAboveHorizon(altitudeDegrees: number, view: SkyViewBox): number {
  const skyTop = view.safeInset
  const skyHeight = view.horizonY - skyTop
  const altitude = clamp(altitudeDegrees, 0, view.maxAltitudeDegrees)
  const t = altitude / view.maxAltitudeDegrees
  return view.horizonY - t * skyHeight
}

function projectBelowHorizon(altitudeDegrees: number, view: SkyViewBox): number {
  const groundBottom = view.height - 12
  const groundHeight = groundBottom - view.horizonY
  const depth = clamp(-altitudeDegrees / view.maxAltitudeDegrees, 0, 1)
  return view.horizonY + depth * groundHeight
}

function clamp01(value: number): number {
  return clamp(value, 0, 1)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function round(value: number): number {
  return Math.round(value * 10) / 10
}
