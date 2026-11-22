/** Formats day length for display, e.g. "12h 04m". */
export function formatDayLength(dayLengthMs: number | null): string {
  if (dayLengthMs === null || dayLengthMs < 0) return '—'

  const totalMinutes = Math.round(dayLengthMs / 60_000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${String(minutes).padStart(2, '0')}m`
}

/** Relative time from `from` to `target`, e.g. "in 2h 15m" / "2h 15m ago". */
export function formatRelativeTo(
  target: Date | null,
  from: Date,
): string | null {
  if (!target) return null

  const deltaMs = target.getTime() - from.getTime()
  const absMinutes = Math.round(Math.abs(deltaMs) / 60_000)
  const hours = Math.floor(absMinutes / 60)
  const minutes = absMinutes % 60
  const body =
    hours > 0 ? `${hours}h ${String(minutes).padStart(2, '0')}m` : `${minutes}m`

  if (Math.abs(deltaMs) < 60_000) return 'now'
  return deltaMs > 0 ? `in ${body}` : `${body} ago`
}
