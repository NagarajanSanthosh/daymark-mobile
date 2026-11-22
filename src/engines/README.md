# Calculation engines

Pure TypeScript modules for solar position, daylight windows, and geometry helpers.

**Rules**

- No React imports
- No DOM / browser APIs that are not needed for math
- Features import `@/engines/solar` or `@/engines/daylight` — never `suncalc` directly

## Solar (`engines/solar`)

| Function | Purpose |
|----------|---------|
| `getSunPosition` | Altitude + azimuth for a lat/lng + datetime |
| `getSolarDayEvents` | Sunrise, sunset, solar noon (null when polar / missing) |
| `getMoonSky` | Moon altitude/azimuth + illumination for night UI |

UI formats times with the location timezone; the engine returns `Date` values only.

## Daylight (`engines/daylight`)

| Function | Purpose |
|----------|---------|
| `getLightWindows` | Golden / blue / twilight intervals for a day |
| `getActiveLightPhase` | Current phase + next upcoming window |

## Geometry (`engines/geometry`)

| Function | Purpose |
|----------|---------|
| `projectSunToSky` | Map altitude + day progress → SVG x/y |
| `skyPointsToPath` | Build an SVG polyline `d` from sky points |
