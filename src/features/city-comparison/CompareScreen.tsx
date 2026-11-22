import { Pressable, StyleSheet, Text, View } from 'react-native'
import { LocationSearch } from '@/components/shared/LocationSearch'
import { PlaceControls } from '@/components/shared/PlaceControls'
import { Panel } from '@/components/ui/Panel'
import { Screen } from '@/components/ui/Screen'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useSharedPlace } from '@/context/PlaceContext'
import { useCityCompare } from '@/features/city-comparison/hooks/useCityCompare'
import { formatDayLength } from '@/features/sun-explorer/utils/formatDayLength'
import { formatLocalDate } from '@/features/sun-explorer/utils/formatLocalDate'
import { formatSolarTime } from '@/features/sun-explorer/utils/formatSolarTime'
import { SAMPLE_LOCATIONS } from '@/data/sample-locations'
import { colors, spacing } from '@/theme/colors'
import type { Location } from '@/types/location'
import { locationEquals } from '@/utils/date'

export function CompareScreen() {
  const {
    location,
    setLocation,
    date,
    setDate,
    dateInputValue,
    setDateFromInput,
    jumpToToday,
  } = useSharedPlace()
  const compare = useCityCompare({
    primaryLocation: location,
    dayAnchor: date,
  })

  function onChangeAt(index: number, next: Location) {
    compare.setLocationAt(index, next)
    if (index === 0) setLocation(next)
  }

  function onSwap() {
    const nextA = compare.locations[1]
    compare.swapFirstTwo()
    if (nextA) setLocation(nextA)
  }

  function addNextSample() {
    const next = SAMPLE_LOCATIONS.find(
      (sample) => !compare.locations.some((item) => locationEquals(item, sample)),
    )
    if (next) compare.addCity(next)
  }

  return (
    <Screen>
      <SectionHeader
        eyebrow="Daylight Comparison"
        title="Compare cities"
        subtitle={`${formatLocalDate(date, location.timezone)} · ${compare.locations.length}/${compare.maxCities} cities`}
      />

      <PlaceControls
        date={date}
        setDate={setDate}
        dateInputValue={dateInputValue}
        onDateChange={setDateFromInput}
        onJumpToday={jumpToToday}
        onLocation={setLocation}
      />

      <View style={styles.actions}>
        <Pressable style={styles.action} onPress={onSwap}>
          <Text style={styles.actionText}>Swap A ↔ B</Text>
        </Pressable>
        {compare.locations.length < compare.maxCities ? (
          <Pressable style={styles.action} onPress={addNextSample}>
            <Text style={styles.actionText}>Add city</Text>
          </Pressable>
        ) : null}
      </View>

      {compare.delta ? (
        <Panel>
          <Text style={styles.delta}>{compare.delta.headline}</Text>
          {compare.goldenDelta ? (
            <Text style={styles.deltaSub}>{compare.goldenDelta.headline}</Text>
          ) : null}
          {compare.earlierEvening ? (
            <Text style={styles.deltaSub}>{compare.earlierEvening.headline}</Text>
          ) : null}
        </Panel>
      ) : null}

      {compare.cities.map((city, index) => (
        <Panel key={`${city.location.id}-${index}`}>
          <Text style={styles.cityIndex}>City {String.fromCharCode(65 + index)}</Text>
          <LocationSearch
            value={city.location}
            onChange={(next) => onChangeAt(index, next)}
          />
          <View style={styles.metrics}>
            <Metric
              label="Sunrise"
              value={formatSolarTime(city.events.sunrise, city.location.timezone)}
            />
            <Metric
              label="Sunset"
              value={formatSolarTime(city.events.sunset, city.location.timezone)}
            />
            <Metric label="Day length" value={formatDayLength(city.events.dayLengthMs)} />
            <Metric
              label="Golden eve"
              value={formatDayLength(city.goldenEveningDurationMs)}
            />
          </View>
          {index > 0 ? (
            <Pressable
              onPress={() => compare.removeCity(index)}
              style={styles.remove}
            >
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          ) : null}
        </Panel>
      ))}
    </Screen>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  action: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionText: {
    color: colors.mist100,
    fontSize: 12,
    fontWeight: '600',
  },
  delta: {
    color: colors.sun400,
    fontSize: 16,
    fontWeight: '700',
  },
  deltaSub: {
    color: colors.mist300,
    fontSize: 13,
    marginTop: 6,
  },
  cityIndex: {
    color: colors.mist500,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  metric: {
    width: '46%',
    gap: 2,
  },
  metricLabel: {
    color: colors.mist500,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  metricValue: {
    color: colors.mist50,
    fontSize: 16,
    fontWeight: '700',
  },
  remove: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  removeText: {
    color: colors.dusk500,
    fontSize: 13,
    fontWeight: '600',
  },
})
