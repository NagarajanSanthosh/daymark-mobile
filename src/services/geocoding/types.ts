/** Raw Open-Meteo geocoding result row. */
export type OpenMeteoGeocodingResult = {
  id: number
  name: string
  latitude: number
  longitude: number
  country?: string
  country_code?: string
  admin1?: string
  timezone?: string
  population?: number
}

export type OpenMeteoGeocodingResponse = {
  results?: OpenMeteoGeocodingResult[]
  generationtime_ms?: number
}
