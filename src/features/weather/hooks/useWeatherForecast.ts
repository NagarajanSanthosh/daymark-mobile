import { useQuery } from '@tanstack/react-query'
import { fetchWeatherForecast } from '@/services/weather/openMeteoForecast'
import type { Location } from '@/types/location'

type UseWeatherForecastOptions = {
  location: Location
}

export function useWeatherForecast({ location }: UseWeatherForecastOptions) {
  return useQuery({
    queryKey: [
      'weather',
      location.latitude,
      location.longitude,
      location.timezone,
    ],
    queryFn: ({ signal }) =>
      fetchWeatherForecast({
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: location.timezone,
        signal,
      }),
  })
}
