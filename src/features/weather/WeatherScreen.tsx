import { useMemo } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { LocationSearch } from '@/components/shared/LocationSearch'
import { PlaceControls } from '@/components/shared/PlaceControls'
import { Panel } from '@/components/ui/Panel'
import { Screen } from '@/components/ui/Screen'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useSharedPlace } from '@/context/PlaceContext'
import { getLightWindows } from '@/engines/daylight'
import { useWeatherForecast } from '@/features/weather/hooks/useWeatherForecast'
import { getShootabilityNote } from '@/features/weather/utils/shootability'
import { filterHoursForLocalDay } from '@/features/weather/utils/todayHours'
import { formatUv, getUvCategory } from '@/features/weather/utils/uvScale'
import { getWeatherSkyStory } from '@/features/weather/utils/weatherCode'
import { formatLocalDate } from '@/features/sun-explorer/utils/formatLocalDate'
import { formatSolarTime } from '@/features/sun-explorer/utils/formatSolarTime'
import { colors, spacing } from '@/theme/colors'

export function WeatherScreen() {
  const {
    location,
    setLocation,
    date,
    setDate,
    dateInputValue,
    setDateFromInput,
    jumpToToday,
  } = useSharedPlace()
  const forecast = useWeatherForecast({ location })
  const wallNow = useMemo(() => new Date(), [forecast.dataUpdatedAt])

  const dayHours = useMemo(() => {
    if (!forecast.data) return []
    return filterHoursForLocalDay(forecast.data.hourly, date, location.timezone)
  }, [forecast.data, location.timezone, date])

  const windows = useMemo(
    () =>
      getLightWindows({
        latitude: location.latitude,
        longitude: location.longitude,
        date,
      }),
    [location.latitude, location.longitude, date],
  )

  const shootability = useMemo(() => {
    if (!forecast.data) return null
    return getShootabilityNote(windows, forecast.data.hourly, wallNow)
  }, [forecast.data, windows, wallNow])

  const sky = getWeatherSkyStory(forecast.data?.current.weatherCode ?? null)
  const uv = getUvCategory(forecast.data?.current.uvIndex)

  return (
    <Screen>
      <SectionHeader
        eyebrow="UV & Weather"
        title="Outdoor conditions"
        subtitle={`${location.name} · ${formatLocalDate(date, location.timezone)}`}
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

      {forecast.isLoading ? (
        <Panel style={styles.center}>
          <ActivityIndicator color={colors.sun500} />
          <Text style={styles.muted}>Fetching Open-Meteo forecast…</Text>
        </Panel>
      ) : null}

      {forecast.isError ? (
        <Panel>
          <Text style={styles.error}>Weather unavailable. Check connection and try again.</Text>
        </Panel>
      ) : null}

      {forecast.data ? (
        <>
          <Panel>
            <Text style={styles.temp}>
              {Math.round(forecast.data.current.temperatureC)}°
            </Text>
            <Text style={styles.skyLabel}>{sky.label}</Text>
            <Text style={styles.skyStory}>{sky.story}</Text>
            <View style={styles.stats}>
              <Stat label="UV" value={formatUv(forecast.data.current.uvIndex)} hint={uv.label} />
              <Stat
                label="Clouds"
                value={`${Math.round(forecast.data.current.cloudCoverPct)}%`}
              />
              <Stat
                label="UV max"
                value={formatUv(forecast.data.uvIndexMaxToday)}
              />
            </View>
          </Panel>

          {shootability ? (
            <Panel>
              <Text style={styles.shootTitle}>{shootability.headline}</Text>
              <Text style={styles.shootDetail}>{shootability.detail}</Text>
            </Panel>
          ) : null}

          <Panel>
            <Text style={styles.section}>Next hours</Text>
            <View style={styles.hours}>
              {(dayHours.length > 0 ? dayHours : forecast.data.hourly)
                .slice(0, 8)
                .map((hour) => (
                  <View key={hour.time.toISOString()} style={styles.hour}>
                    <Text style={styles.hourTime}>
                      {formatSolarTime(hour.time, location.timezone)}
                    </Text>
                    <Text style={styles.hourTemp}>
                      {hour.temperatureC == null ? '—' : `${Math.round(hour.temperatureC)}°`}
                    </Text>
                    <Text style={styles.hourUv}>UV {formatUv(hour.uvIndex)}</Text>
                  </View>
                ))}
            </View>
          </Panel>
        </>
      ) : null}
    </Screen>
  )
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {hint ? <Text style={styles.statHint}>{hint}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  muted: {
    color: colors.mist400,
    fontSize: 13,
  },
  error: {
    color: colors.dusk500,
    fontSize: 14,
  },
  temp: {
    color: colors.mist50,
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -1,
  },
  skyLabel: {
    color: colors.sun400,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  skyStory: {
    color: colors.mist300,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  stats: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.lg,
  },
  stat: {
    flex: 1,
    gap: 2,
  },
  statLabel: {
    color: colors.mist500,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  statValue: {
    color: colors.mist50,
    fontSize: 18,
    fontWeight: '700',
  },
  statHint: {
    color: colors.mist400,
    fontSize: 12,
  },
  shootTitle: {
    color: colors.mist50,
    fontSize: 16,
    fontWeight: '700',
  },
  shootDetail: {
    color: colors.mist300,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  section: {
    color: colors.mist400,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  hours: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  hour: {
    width: '22%',
    minWidth: 68,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: spacing.sm,
    gap: 2,
  },
  hourTime: {
    color: colors.mist400,
    fontSize: 11,
  },
  hourTemp: {
    color: colors.mist50,
    fontSize: 16,
    fontWeight: '700',
  },
  hourUv: {
    color: colors.sun400,
    fontSize: 11,
  },
})
