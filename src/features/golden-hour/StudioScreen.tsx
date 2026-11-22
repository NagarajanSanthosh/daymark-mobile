import { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { LocationSearch } from '@/components/shared/LocationSearch'
import { PlaceControls } from '@/components/shared/PlaceControls'
import { Panel } from '@/components/ui/Panel'
import { Screen } from '@/components/ui/Screen'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useSharedPlace } from '@/context/PlaceContext'
import { getWindowBandColor } from '@/features/golden-hour/utils/windowColors'
import { useLightStudio } from '@/features/golden-hour/hooks/useLightStudio'
import { formatLocalDate } from '@/features/sun-explorer/utils/formatLocalDate'
import { formatSolarTime } from '@/features/sun-explorer/utils/formatSolarTime'
import { formatRelativeTo } from '@/features/sun-explorer/utils/formatDayLength'
import { colors, spacing } from '@/theme/colors'

export function StudioScreen() {
  const {
    location,
    setLocation,
    date,
    setDate,
    dateInputValue,
    setDateFromInput,
    jumpToToday,
  } = useSharedPlace()
  const { instant, windows, active } = useLightStudio({
    location,
    dayAnchor: date,
  })

  const featured = useMemo(
    () =>
      windows.filter((window) =>
        [
          'golden-morning',
          'golden-evening',
          'blue-morning',
          'blue-evening',
          'civil-dawn',
          'civil-dusk',
        ].includes(window.id),
      ),
    [windows],
  )

  return (
    <Screen>
      <SectionHeader
        eyebrow="Golden Hour Studio"
        title="Shoot windows"
        subtitle={`${location.name} · ${formatLocalDate(instant, location.timezone)}`}
      />

      <LocationSearch value={location} onChange={setLocation} />
      <PlaceControls
        date={date}
        setDate={setDate}
        dateInputValue={dateInputValue}
        onDateChange={setDateFromInput}
        onJumpToday={jumpToToday}
        onLocation={setLocation}
      />

      <Panel>
        <Text style={styles.nowLabel}>Now</Text>
        <Text style={styles.nowPhase}>{active.label}</Text>
        <Text style={styles.nowMeta}>
          {formatSolarTime(instant, location.timezone)}
          {active.next
            ? ` · next ${active.next.window.label} ${formatRelativeTo(active.next.startsAt, instant) ?? ''}`
            : ''}
        </Text>
      </Panel>

      <View style={styles.list}>
        {featured.map((window) => {
          const start = window.interval.start
          const end = window.interval.end
          const accent = getWindowBandColor(window.id)
          return (
            <Panel key={window.id} style={styles.windowCard}>
              <View style={styles.windowHeader}>
                <View style={[styles.dot, { backgroundColor: accent }]} />
                <Text style={styles.windowTitle}>{window.label}</Text>
              </View>
              <Text style={styles.windowTime}>
                {formatSolarTime(start, location.timezone)} –{' '}
                {formatSolarTime(end, location.timezone)}
              </Text>
              <Text style={styles.windowPeriod}>{window.period}</Text>
            </Panel>
          )
        })}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  nowLabel: {
    color: colors.mist500,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  nowPhase: {
    color: colors.sun400,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  nowMeta: {
    color: colors.mist300,
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  list: {
    gap: spacing.sm,
  },
  windowCard: {
    paddingVertical: spacing.md,
  },
  windowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  windowTitle: {
    color: colors.mist50,
    fontSize: 15,
    fontWeight: '700',
  },
  windowTime: {
    color: colors.mist100,
    fontSize: 16,
    marginTop: 8,
    fontWeight: '600',
  },
  windowPeriod: {
    color: colors.mist400,
    fontSize: 12,
    marginTop: 4,
    textTransform: 'capitalize',
  },
})
