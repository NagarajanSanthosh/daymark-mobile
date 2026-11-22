import type { GeoCoordinates } from '@/engines/solar'

export type TimeInterval = {
  start: Date | null
  end: Date | null
}

export type LightWindowId =
  | 'astro-dawn'
  | 'nautical-dawn'
  | 'civil-dawn'
  | 'blue-morning'
  | 'golden-morning'
  | 'daylight'
  | 'golden-evening'
  | 'blue-evening'
  | 'civil-dusk'
  | 'nautical-dusk'
  | 'astro-dusk'

export type LightWindow = {
  id: LightWindowId
  label: string
  period: 'morning' | 'day' | 'evening'
  interval: TimeInterval
}

export type LightWindowsInput = GeoCoordinates & {
  date: Date
}

export type LightPhaseId =
  | 'night'
  | 'astro'
  | 'nautical'
  | 'civil'
  | 'blue'
  | 'golden'
  | 'day'

export type ActiveLightPhase = {
  phase: LightPhaseId
  label: string
  /** Window currently containing `at`, if any. */
  current: LightWindow | null
  /** Next upcoming window start after `at`. */
  next: { window: LightWindow; startsAt: Date } | null
}
