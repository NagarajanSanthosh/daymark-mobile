import type {
  ActiveLightPhase,
  LightPhaseId,
  LightWindow,
  LightWindowsInput,
} from '@/engines/daylight/types'
import { getLightWindows } from '@/engines/daylight/windows'

type ActivePhaseInput = LightWindowsInput & {
  at: Date
}

const PHASE_PRIORITY: Array<{
  ids: LightWindow['id'][]
  phase: LightPhaseId
  label: string
}> = [
  { ids: ['golden-morning', 'golden-evening'], phase: 'golden', label: 'Golden hour' },
  { ids: ['blue-morning', 'blue-evening'], phase: 'blue', label: 'Blue hour' },
  { ids: ['civil-dawn', 'civil-dusk'], phase: 'civil', label: 'Civil twilight' },
  { ids: ['nautical-dawn', 'nautical-dusk'], phase: 'nautical', label: 'Nautical twilight' },
  { ids: ['astro-dawn', 'astro-dusk'], phase: 'astro', label: 'Astronomical twilight' },
  { ids: ['daylight'], phase: 'day', label: 'Daylight' },
]

/**
 * Resolves the active photography/twilight phase at instant `at`,
 * plus the next upcoming named window.
 */
export function getActiveLightPhase(input: ActivePhaseInput): ActiveLightPhase {
  const windows = getLightWindows(input)
  const atMs = input.at.getTime()

  const current =
    PHASE_PRIORITY.map((entry) => {
      const match = windows.find(
        (window) =>
          entry.ids.includes(window.id) && containsInstant(window, atMs),
      )
      return match
        ? { window: match, phase: entry.phase, label: entry.label }
        : null
    }).find(Boolean) ?? null

  let next = findNextWindow(windows, atMs)

  // After the last dusk window, look at tomorrow so night still has a "next light".
  if (!next) {
    const tomorrow = new Date(input.date.getTime() + 24 * 60 * 60 * 1000)
    const tomorrowWindows = getLightWindows({ ...input, date: tomorrow })
    next = findNextWindow(tomorrowWindows, atMs)
  }

  if (!current) {
    return {
      phase: 'night',
      label: 'Night',
      current: null,
      next,
    }
  }

  return {
    phase: current.phase,
    label: current.label,
    current: current.window,
    next,
  }
}

function containsInstant(window: LightWindow, atMs: number): boolean {
  const { start, end } = window.interval
  if (!start || !end) return false
  return atMs >= start.getTime() && atMs < end.getTime()
}

function findNextWindow(
  windows: LightWindow[],
  atMs: number,
): ActiveLightPhase['next'] {
  const upcoming = windows
    .map((window) => {
      const start = window.interval.start
      if (!start || start.getTime() <= atMs) return null
      return { window, startsAt: start }
    })
    .filter((item): item is { window: LightWindow; startsAt: Date } => item !== null)
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())

  return upcoming[0] ?? null
}
