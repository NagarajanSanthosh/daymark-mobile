import type { WeatherHour } from '@/services/weather/types'

function zonedDateKey(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

/** Hours that fall on the same civil day as `instant` in `timeZone`. */
export function filterHoursForLocalDay(
  hourly: WeatherHour[],
  instant: Date,
  timeZone: string,
): WeatherHour[] {
  const key = zonedDateKey(instant, timeZone)
  return hourly.filter((hour) => zonedDateKey(hour.time, timeZone) === key)
}
