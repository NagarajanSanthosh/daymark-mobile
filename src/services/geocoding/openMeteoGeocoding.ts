import type { Location } from '@/types/location'
import type {
  OpenMeteoGeocodingResponse,
  OpenMeteoGeocodingResult,
} from '@/services/geocoding/types'

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'

function mapResult(row: OpenMeteoGeocodingResult): Location {
  return {
    id: `om-${row.id}`,
    name: row.name,
    admin: row.admin1,
    country: row.country ?? row.country_code ?? 'Unknown',
    latitude: row.latitude,
    longitude: row.longitude,
    timezone: row.timezone ?? 'UTC',
  }
}

/**
 * Search places via Open-Meteo geocoding (no API key).
 * Returns an empty list when nothing matches.
 */
export async function searchLocations(
  query: string,
  options?: { signal?: AbortSignal; count?: number },
): Promise<Location[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  const params = new URLSearchParams({
    name: trimmed,
    count: String(options?.count ?? 8),
    language: 'en',
    format: 'json',
  })

  const response = await fetch(`${GEOCODING_URL}?${params}`, {
    signal: options?.signal,
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Geocoding failed (${response.status})`)
  }

  const data = (await response.json()) as OpenMeteoGeocodingResponse
  return (data.results ?? []).map(mapResult)
}
