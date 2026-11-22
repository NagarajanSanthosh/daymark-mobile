import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { SAMPLE_LOCATIONS } from '@/data/sample-locations'
import { searchLocations } from '@/services/geocoding/openMeteoGeocoding'
import type { Location } from '@/types/location'

const DEBOUNCE_MS = 280

/**
 * Debounced Open-Meteo geocoding with sample cities as the empty-query fallback.
 */
export function useLocationSearch(query: string) {
  const [debounced, setDebounced] = useState(query.trim())

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [query])

  const live = useQuery({
    queryKey: ['geocode', debounced],
    queryFn: ({ signal }) => searchLocations(debounced, { signal }),
    enabled: debounced.length >= 2,
  })

  const trimmed = query.trim()
  let results: Location[] = SAMPLE_LOCATIONS
  let searching = false

  if (trimmed.length >= 2) {
    searching = live.isFetching || trimmed !== debounced
    if (live.data) {
      results = live.data
    } else if (live.isError) {
      const q = trimmed.toLowerCase()
      results = SAMPLE_LOCATIONS.filter((location) =>
        [location.name, location.admin, location.country]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
    } else {
      results = []
    }
  }

  return {
    results,
    searching,
    error: live.isError ? live.error : null,
    isLive: debounced.length >= 2,
  }
}
