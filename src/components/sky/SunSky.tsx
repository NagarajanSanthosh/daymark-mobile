import { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg'
import { projectSunToSky } from '@/engines/geometry'
import type { SolarDayEvents, SunPosition } from '@/engines/solar'
import { sampleSunPath } from '@/features/sun-explorer/utils/sampleSkyPaths'
import { getSkyPalette } from '@/features/sun-explorer/utils/skyPalette'
import { getDayProgress } from '@/features/sun-explorer/utils/zonedTime'
import { formatSolarTime } from '@/features/sun-explorer/utils/formatSolarTime'
import type { Location } from '@/types/location'
import { colors } from '@/theme/colors'

type SunSkyProps = {
  location: Location
  dayAnchor: Date
  instant: Date
  position: SunPosition
  events: SolarDayEvents
  width: number
}

const HEIGHT = 220
const VIEW = { width: 600, height: 280, horizonY: 210, paddingX: 40, safeInset: 40, maxAltitudeDegrees: 90 }

export function SunSky({
  location,
  dayAnchor,
  instant,
  position,
  events,
  width,
}: SunSkyProps) {
  const palette = getSkyPalette(position.altitudeDegrees)
  const path = useMemo(
    () => sampleSunPath(location, dayAnchor).path,
    [location, dayAnchor],
  )
  const sun = projectSunToSky({
    altitudeDegrees: position.altitudeDegrees,
    dayProgress: getDayProgress(instant, location.timezone),
    view: VIEW,
  })

  return (
    <View style={styles.wrap}>
      <Svg width={width} height={HEIGHT} viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}>
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={palette.top} />
            <Stop offset="55%" stopColor={palette.mid} />
            <Stop offset="100%" stopColor={palette.low} />
          </LinearGradient>
          <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#ffd27a" stopOpacity="0.9" />
            <Stop offset="45%" stopColor="#f0a43a" stopOpacity="0.5" />
            <Stop offset="100%" stopColor="#f0a43a" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <Rect width={VIEW.width} height={VIEW.height} rx="18" fill="url(#sky)" />
        <Path
          d={path}
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1.5"
          strokeDasharray="5 7"
        />
        <Rect y={VIEW.horizonY} width={VIEW.width} height={70} fill="rgba(5,8,15,0.55)" />
        <SvgText x="40" y="236" fill={colors.mist400} fontSize="11">
          E
        </SvgText>
        <SvgText x="300" y="236" fill={colors.mist400} fontSize="11" textAnchor="middle">
          S
        </SvgText>
        <SvgText x="560" y="236" fill={colors.mist400} fontSize="11" textAnchor="end">
          W
        </SvgText>

        <Circle cx={sun.x} cy={sun.y} r="32" fill="url(#glow)" />
        <Circle cx={sun.x} cy={sun.y} r="11" fill={colors.sun400} />
        <Circle cx={sun.x} cy={sun.y} r="6" fill="#fff1c9" />
      </Svg>

      <View style={styles.meta}>
        <Meta
          label="Sunrise"
          value={formatSolarTime(events.sunrise, location.timezone)}
        />
        <Meta
          label="Noon"
          value={formatSolarTime(events.solarNoon, location.timezone)}
        />
        <Meta
          label="Sunset"
          value={formatSolarTime(events.sunset, location.timezone)}
        />
      </View>
    </View>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  metaItem: {
    alignItems: 'center',
    gap: 2,
  },
  metaLabel: {
    color: colors.mist500,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  metaValue: {
    color: colors.mist50,
    fontSize: 16,
    fontWeight: '700',
  },
})
