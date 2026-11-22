import { useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { LocationSearch } from '@/components/shared/LocationSearch'
import { PlaceControls } from '@/components/shared/PlaceControls'
import { Panel } from '@/components/ui/Panel'
import { Screen } from '@/components/ui/Screen'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useSharedPlace } from '@/context/PlaceContext'
import { formatDayLength } from '@/features/sun-explorer/utils/formatDayLength'
import {
  buildYearSeries,
  extremes,
  metricValue,
  type YearMetric,
} from '@/features/year-heatmap/utils/buildYearSeries'
import {
  buildHeatColorScale,
  colorForValue,
} from '@/features/year-heatmap/utils/colorScale'
import { colors, spacing } from '@/theme/colors'
import { toDateInputValue } from '@/utils/date'

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

export function YearScreen() {
  const {
    location,
    setLocation,
    date,
    setDate,
    dateInputValue,
    setDateFromInput,
    jumpToToday,
  } = useSharedPlace()
  const [metric, setMetric] = useState<YearMetric>('day-length')
  const year = date.getFullYear()
  const selectedKey = toDateInputValue(date)

  const series = useMemo(() => buildYearSeries(location, year), [location, year])
  const colorScale = useMemo(
    () => buildHeatColorScale(series.days, metric),
    [series.days, metric],
  )
  const { shortest, longest } = useMemo(
    () => extremes(series.days, metric),
    [series.days, metric],
  )
  const selected = useMemo(
    () => series.days.find((day) => toDateInputValue(day.date) === selectedKey) ?? null,
    [series.days, selectedKey],
  )

  function handleYearChange(nextYear: number) {
    const next = new Date(date)
    next.setFullYear(nextYear)
    if (next.getFullYear() !== nextYear) {
      next.setFullYear(nextYear, 11, 31)
    }
    next.setHours(12, 0, 0, 0)
    setDate(next)
  }

  return (
    <Screen>
      <SectionHeader
        eyebrow="Year Heatmap"
        title={`${year} daylight`}
        subtitle="Tap a day to set the shared calendar date"
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

      <View style={styles.toolbar}>
        <Pressable style={styles.chip} onPress={() => handleYearChange(year - 1)}>
          <Text style={styles.chipText}>← {year - 1}</Text>
        </Pressable>
        <Pressable style={styles.chip} onPress={() => handleYearChange(year + 1)}>
          <Text style={styles.chipText}>{year + 1} →</Text>
        </Pressable>
        <Pressable
          style={[styles.chip, metric === 'day-length' && styles.chipActive]}
          onPress={() => setMetric('day-length')}
        >
          <Text style={styles.chipText}>Day length</Text>
        </Pressable>
        <Pressable
          style={[styles.chip, metric === 'golden-evening' && styles.chipActive]}
          onPress={() => setMetric('golden-evening')}
        >
          <Text style={styles.chipText}>Golden eve</Text>
        </Pressable>
      </View>

      <Panel style={styles.gridPanel}>
        {series.months.map((monthDays, monthIndex) => (
          <View key={`month-${monthIndex}`} style={styles.monthRow}>
            <Text style={styles.monthLabel}>{MONTHS[monthIndex]}</Text>
            <View style={styles.cells}>
              {monthDays.map((day) => {
                const key = toDateInputValue(day.date)
                const value = metricValue(day, metric)
                const selectedDay = key === selectedKey
                return (
                  <Pressable
                    key={key}
                    onPress={() => setDate(day.date)}
                    style={[
                      styles.cell,
                      { backgroundColor: colorForValue(value, colorScale) },
                      selectedDay && styles.cellSelected,
                    ]}
                  />
                )
              })}
            </View>
          </View>
        ))}
      </Panel>

      <Panel>
        <Text style={styles.selectedTitle}>
          {selected ? toDateInputValue(selected.date) : 'No day selected'}
        </Text>
        <Text style={styles.selectedMeta}>
          {selected
            ? `${metric === 'day-length' ? 'Day length' : 'Golden evening'}: ${formatDayLength(metricValue(selected, metric))}`
            : 'Pick a cell above'}
        </Text>
        <Text style={styles.extremes}>
          Shortest {shortest ? toDateInputValue(shortest.date) : '—'} · Longest{' '}
          {longest ? toDateInputValue(longest.date) : '—'}
        </Text>
      </Panel>
    </Screen>
  )
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActive: {
    backgroundColor: 'rgba(240,164,58,0.16)',
    borderColor: colors.sun500,
  },
  chipText: {
    color: colors.mist100,
    fontSize: 12,
    fontWeight: '600',
  },
  gridPanel: {
    gap: 4,
    paddingVertical: spacing.md,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  monthLabel: {
    width: 28,
    color: colors.mist500,
    fontSize: 10,
    fontWeight: '700',
  },
  cells: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  cell: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  cellSelected: {
    borderWidth: 1,
    borderColor: colors.mist50,
  },
  selectedTitle: {
    color: colors.mist50,
    fontSize: 18,
    fontWeight: '700',
  },
  selectedMeta: {
    color: colors.mist300,
    fontSize: 13,
    marginTop: 6,
  },
  extremes: {
    color: colors.mist500,
    fontSize: 12,
    marginTop: 10,
  },
})
