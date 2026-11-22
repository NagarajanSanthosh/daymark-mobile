import { getZonedParts } from '@/features/sun-explorer/utils/zonedTime'

/** Short local calendar label, e.g. "Thu, 20 Nov". */
export function formatLocalDate(date: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      timeZone,
    }).format(date)
  } catch {
    const parts = getZonedParts(date, timeZone)
    return `${parts.day}/${parts.month}/${parts.year}`
  }
}
