import * as Location from 'expo-location'
import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { SAMPLE_LOCATIONS } from '@/data/sample-locations'
import { colors, spacing } from '@/theme/colors'
import type { Location as Place } from '@/types/location'
import { shiftDateByDays } from '@/utils/date'

type PlaceControlsProps = {
  dateInputValue: string
  onDateChange: (value: string) => void
  onJumpToday: () => void
  onLocation: (location: Place) => void
  date: Date
  setDate: (date: Date) => void
}

export function PlaceControls({
  dateInputValue,
  onJumpToday,
  onLocation,
  date,
  setDate,
}: PlaceControlsProps) {
  const [locating, setLocating] = useState(false)

  async function useMyLocation() {
    try {
      setLocating(true)
      const permission = await Location.requestForegroundPermissionsAsync()
      if (!permission.granted) return

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })
      const { latitude, longitude } = position.coords
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude })

      onLocation({
        id: `geo-${latitude.toFixed(3)}-${longitude.toFixed(3)}`,
        name: place?.city || place?.subregion || place?.region || 'My location',
        admin: place?.region || undefined,
        country: place?.country || '',
        latitude,
        longitude,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      })
    } finally {
      setLocating(false)
    }
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Pressable
          style={styles.chip}
          onPress={() => setDate(shiftDateByDays(date, -1))}
        >
          <Text style={styles.chipText}>← Day</Text>
        </Pressable>
        <View style={styles.datePill}>
          <Text style={styles.dateText}>{dateInputValue}</Text>
        </View>
        <Pressable
          style={styles.chip}
          onPress={() => setDate(shiftDateByDays(date, 1))}
        >
          <Text style={styles.chipText}>Day →</Text>
        </Pressable>
      </View>

      <View style={styles.row}>
        <Pressable style={styles.chip} onPress={onJumpToday}>
          <Text style={styles.chipText}>Today</Text>
        </Pressable>
        <Pressable style={styles.chip} onPress={useMyLocation} disabled={locating}>
          {locating ? (
            <ActivityIndicator color={colors.sun500} size="small" />
          ) : (
            <Text style={styles.chipText}>Use my location</Text>
          )}
        </Pressable>
        <Pressable
          style={styles.chip}
          onPress={() => onLocation(SAMPLE_LOCATIONS[0])}
        >
          <Text style={styles.chipText}>Chennai</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    alignItems: 'center',
  },
  chip: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 34,
    justifyContent: 'center',
  },
  chipText: {
    color: colors.mist100,
    fontSize: 12,
    fontWeight: '600',
  },
  datePill: {
    flexGrow: 1,
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(240,164,58,0.12)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dateText: {
    color: colors.sun400,
    fontSize: 13,
    fontWeight: '700',
  },
})
