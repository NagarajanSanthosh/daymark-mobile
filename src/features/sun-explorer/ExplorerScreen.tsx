import { useEffect } from 'react'
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import Slider from '@react-native-community/slider'
import { LocationSearch } from '@/components/shared/LocationSearch'
import { PlaceControls } from '@/components/shared/PlaceControls'
import { ReadoutGrid } from '@/components/shared/ReadoutGrid'
import { SunSky } from '@/components/sky/SunSky'
import { Panel } from '@/components/ui/Panel'
import { Screen } from '@/components/ui/Screen'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useSharedPlace } from '@/context/PlaceContext'
import { useExplorerTime } from '@/features/sun-explorer/hooks/useExplorerTime'
import { useSolarDay } from '@/features/sun-explorer/hooks/useSolarDay'
import { formatDayLength } from '@/features/sun-explorer/utils/formatDayLength'
import { formatSolarTime } from '@/features/sun-explorer/utils/formatSolarTime'
import { getSolarPhaseLabel } from '@/features/sun-explorer/utils/skyPalette'
import { colors, spacing } from '@/theme/colors'

export function ExplorerScreen() {
  const {
    location,
    setLocation,
    date,
    setDate,
    dateInputValue,
    setDateFromInput,
    jumpToToday,
  } = useSharedPlace()
  const { width } = useWindowDimensions()
  const {
    dayAnchor,
    instant,
    progressPercent,
    setProgress,
    jumpToNow,
    syncToLocationNow,
  } = useExplorerTime({ location, dayAnchor: date })
  const { events, position } = useSolarDay({
    location,
    at: instant,
    day: dayAnchor,
  })

  useEffect(() => {
    syncToLocationNow()
  }, [location.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const skyWidth = Math.max(280, width - spacing.lg * 2)

  return (
    <Screen>
      <SectionHeader
        eyebrow="Sun Explorer"
        title="Watch the day move"
        subtitle={`${location.name} · ${location.timezone.replace(/_/g, ' ')}`}
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

      <Panel style={styles.skyPanel}>
        <SunSky
          location={location}
          dayAnchor={dayAnchor}
          instant={instant}
          position={position}
          events={events}
          width={skyWidth}
        />

        <View style={styles.sliderBlock}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderLabel}>Local time</Text>
            <Text style={styles.sliderValue}>
              {formatSolarTime(instant, location.timezone)}
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            value={progressPercent}
            onValueChange={setProgress}
            minimumTrackTintColor={colors.sun500}
            maximumTrackTintColor={colors.night600}
            thumbTintColor={colors.sun400}
          />
          <Pressable onPress={jumpToNow} style={styles.nowBtn}>
            <Text style={styles.nowText}>Jump to now</Text>
          </Pressable>
        </View>
      </Panel>

      <Panel>
        <ReadoutGrid
          items={[
            {
              label: 'Altitude',
              value: `${position.altitudeDegrees.toFixed(1)}°`,
              hint: getSolarPhaseLabel(position.altitudeDegrees),
            },
            {
              label: 'Azimuth',
              value: `${position.azimuthDegrees.toFixed(0)}°`,
              hint: 'From true north',
            },
            {
              label: 'Day length',
              value: formatDayLength(events.dayLengthMs),
            },
            {
              label: 'Phase',
              value: getSolarPhaseLabel(position.altitudeDegrees),
            },
          ]}
        />
      </Panel>
    </Screen>
  )
}

const styles = StyleSheet.create({
  skyPanel: {
    padding: spacing.md,
    gap: spacing.md,
  },
  sliderBlock: {
    gap: spacing.sm,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderLabel: {
    color: colors.mist400,
    fontSize: 13,
  },
  sliderValue: {
    color: colors.mist50,
    fontSize: 16,
    fontWeight: '700',
  },
  slider: {
    width: '100%',
    height: 36,
  },
  nowBtn: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  nowText: {
    color: colors.sun400,
    fontSize: 13,
    fontWeight: '600',
  },
})
