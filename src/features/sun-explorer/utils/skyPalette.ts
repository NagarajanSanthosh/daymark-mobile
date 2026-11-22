export type SkyPalette = {
  top: string
  mid: string
  low: string
}

/** Sky colors driven by solar altitude (degrees). */
export function getSkyPalette(altitudeDegrees: number): SkyPalette {
  if (altitudeDegrees < -12) {
    return { top: '#0f101c', mid: '#1e1a2e', low: '#3a2230' }
  }
  if (altitudeDegrees < -4) {
    return { top: '#1a1730', mid: '#3a2a48', low: '#c45a32' }
  }
  if (altitudeDegrees < 8) {
    return { top: '#1a2744', mid: '#35507a', low: '#e07848' }
  }
  if (altitudeDegrees < 25) {
    return { top: '#243a66', mid: '#4a6fa8', low: '#f0a43a' }
  }
  return { top: '#1e3a5f', mid: '#3d6ea8', low: '#7eb3d9' }
}

export function getSolarPhaseLabel(altitudeDegrees: number): string {
  if (altitudeDegrees < -12) return 'Night'
  if (altitudeDegrees < -4) return 'Twilight'
  if (altitudeDegrees < -0.5) return 'Twilight'
  if (altitudeDegrees < 6) return 'Golden'
  if (altitudeDegrees < 20) return 'Low sun'
  return 'Daylight'
}
