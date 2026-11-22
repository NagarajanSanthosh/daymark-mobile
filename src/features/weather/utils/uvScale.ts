import { colors } from '@/theme/colors'

export type UvCategory = {
  label: string
  range: string
  color: string
  barColor: string
}

/** WHO-style UV index bands for display. */
export function getUvCategory(uvIndex: number | null | undefined): UvCategory {
  if (uvIndex == null || Number.isNaN(uvIndex)) {
    return {
      label: 'Unavailable',
      range: '—',
      color: colors.mist300,
      barColor: colors.mist500,
    }
  }
  if (uvIndex < 3) {
    return {
      label: 'Low',
      range: '0–2',
      color: colors.twilight300,
      barColor: colors.twilight400,
    }
  }
  if (uvIndex < 6) {
    return {
      label: 'Moderate',
      range: '3–5',
      color: colors.sun300,
      barColor: colors.sun400,
    }
  }
  if (uvIndex < 8) {
    return {
      label: 'High',
      range: '6–7',
      color: colors.sun500,
      barColor: colors.sun500,
    }
  }
  if (uvIndex < 11) {
    return {
      label: 'Very high',
      range: '8–10',
      color: colors.dusk500,
      barColor: colors.dusk500,
    }
  }
  return {
    label: 'Extreme',
    range: '11+',
    color: colors.dusk600,
    barColor: colors.dusk600,
  }
}

export function formatUv(uvIndex: number | null | undefined): string {
  if (uvIndex == null || Number.isNaN(uvIndex)) return '—'
  return uvIndex < 10 ? uvIndex.toFixed(1) : String(Math.round(uvIndex))
}
