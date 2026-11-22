import type { LightWindow } from '@/engines/daylight'
import { formatDayLength } from '@/features/sun-explorer/utils/formatDayLength'

export type GoldenCompare = {
  durationMs: number | null
  durationLabel: string
  eveningStart: Date | null
}

export function windowDurationMs(window: LightWindow | null): number | null {
  const start = window?.interval.start
  const end = window?.interval.end
  if (!start || !end) return null
  return Math.max(0, end.getTime() - start.getTime())
}

export function toGoldenCompare(window: LightWindow | null): GoldenCompare {
  const durationMs = windowDurationMs(window)
  return {
    durationMs,
    durationLabel: formatDayLength(durationMs),
    eveningStart: window?.interval.start ?? null,
  }
}

export type GoldenDurationDelta = {
  absLabel: string
  headline: string
  winnerName: string | null
  tie: boolean
}

/** Compare golden-evening durations; positive means A longer. */
export function getGoldenDurationDelta(
  durationA: number | null,
  durationB: number | null,
  nameA: string,
  nameB: string,
): GoldenDurationDelta {
  if (durationA == null || durationB == null) {
    return {
      absLabel: '—',
      headline: 'Golden evening unavailable for one or both cities',
      winnerName: null,
      tie: false,
    }
  }

  const deltaMs = durationA - durationB
  const absLabel = formatDayLength(Math.abs(deltaMs))

  if (Math.abs(deltaMs) < 60_000) {
    return {
      absLabel: '0m',
      headline: 'Same golden evening length',
      winnerName: null,
      tie: true,
    }
  }

  if (deltaMs > 0) {
    return {
      absLabel,
      headline: `${absLabel} longer golden evening in ${nameA}`,
      winnerName: nameA,
      tie: false,
    }
  }

  return {
    absLabel,
    headline: `${absLabel} longer golden evening in ${nameB}`,
    winnerName: nameB,
    tie: false,
  }
}

export type EarlierEvening = {
  headline: string
  winnerName: string | null
  tie: boolean
}

/** Who gets golden evening first (earlier absolute UTC start). */
export function getEarlierGoldenEvening(
  startA: Date | null,
  startB: Date | null,
  nameA: string,
  nameB: string,
): EarlierEvening {
  if (!startA || !startB) {
    return {
      headline: 'Golden evening start unavailable for comparison',
      winnerName: null,
      tie: false,
    }
  }

  const delta = startA.getTime() - startB.getTime()
  if (Math.abs(delta) < 60_000) {
    return {
      headline: 'Golden evening starts at nearly the same moment',
      winnerName: null,
      tie: true,
    }
  }

  if (delta < 0) {
    return {
      headline: `Earlier golden evening in ${nameA}`,
      winnerName: nameA,
      tie: false,
    }
  }

  return {
    headline: `Earlier golden evening in ${nameB}`,
    winnerName: nameB,
    tie: false,
  }
}
