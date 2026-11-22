/** Formats an instant in a specific IANA timezone as HH:mm, or em dash when missing. */
export function formatSolarTime(
  date: Date | null | undefined,
  timeZone: string,
): string {
  if (!date || Number.isNaN(date.getTime())) return '—'

  try {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone,
    }).format(date)
  } catch {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(date)
  }
}
