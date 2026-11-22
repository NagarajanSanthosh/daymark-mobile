import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { SAMPLE_LOCATIONS } from '@/data/sample-locations'
import type { Location } from '@/types/location'
import {
  fromDateInputValue,
  noonToday,
  toDateInputValue,
} from '@/utils/date'

type PlaceContextValue = {
  location: Location
  setLocation: (location: Location) => void
  date: Date
  setDate: (date: Date) => void
  dateInputValue: string
  setDateFromInput: (value: string) => void
  jumpToToday: () => void
}

const PlaceContext = createContext<PlaceContextValue | null>(null)

export function PlaceProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<Location>(SAMPLE_LOCATIONS[0])
  const [date, setDate] = useState<Date>(() => noonToday())

  const setDateFromInput = useCallback((value: string) => {
    if (!value) return
    setDate(fromDateInputValue(value))
  }, [])

  const jumpToToday = useCallback(() => {
    setDate(noonToday())
  }, [])

  const value = useMemo(
    () => ({
      location,
      setLocation,
      date,
      setDate,
      dateInputValue: toDateInputValue(date),
      setDateFromInput,
      jumpToToday,
    }),
    [location, date, setDateFromInput, jumpToToday],
  )

  return <PlaceContext.Provider value={value}>{children}</PlaceContext.Provider>
}

export function useSharedPlace(): PlaceContextValue {
  const ctx = useContext(PlaceContext)
  if (!ctx) {
    throw new Error('useSharedPlace must be used within PlaceProvider')
  }
  return ctx
}
