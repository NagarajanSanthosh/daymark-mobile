import { formatDayLength } from '@/features/sun-explorer/utils/formatDayLength'

export type DayLengthDelta = {
  deltaMs: number
  /** Absolute formatted span, e.g. "1h 12m" */
  absLabel: string
  /** Signed copy, e.g. "+1h 12m longer in Tokyo" */
  headline: string
  winnerName: string | null
  tie: boolean
}

/** Compare two day lengths; positive deltaMs means A is longer. */
export function getDayLengthDelta(
  dayLengthA: number | null,
  dayLengthB: number | null,
  nameA: string,
  nameB: string,
): DayLengthDelta {
  if (dayLengthA == null || dayLengthB == null) {
    return {
      deltaMs: 0,
      absLabel: '—',
      headline: 'Day length unavailable for one or both cities',
      winnerName: null,
      tie: false,
    }
  }

  const deltaMs = dayLengthA - dayLengthB
  const absLabel = formatDayLength(Math.abs(deltaMs))

  if (Math.abs(deltaMs) < 60_000) {
    return {
      deltaMs: 0,
      absLabel: '0m',
      headline: 'Same day length today',
      winnerName: null,
      tie: true,
    }
  }

  if (deltaMs > 0) {
    return {
      deltaMs,
      absLabel,
      headline: `${absLabel} longer in ${nameA}`,
      winnerName: nameA,
      tie: false,
    }
  }

  return {
    deltaMs,
    absLabel,
    headline: `${absLabel} longer in ${nameB}`,
    winnerName: nameB,
    tie: false,
  }
}
