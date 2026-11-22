/** Build YYYY-MM-DD for date pickers. */
export function toDateInputValue(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function fromDateInputValue(value: string): Date {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0)
}

export function noonToday(): Date {
  const now = new Date()
  now.setHours(12, 0, 0, 0)
  return now
}

export function locationEquals(
  a: { latitude: number; longitude: number; id?: string } | undefined,
  b: { latitude: number; longitude: number; id?: string } | undefined,
): boolean {
  if (!a || !b) return false
  if (a.id && b.id && a.id === b.id) return true
  return (
    Math.abs(a.latitude - b.latitude) < 1e-5 &&
    Math.abs(a.longitude - b.longitude) < 1e-5
  )
}

export function shiftDateByDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  next.setHours(12, 0, 0, 0)
  return next
}
