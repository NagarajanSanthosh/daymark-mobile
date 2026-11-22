# Daymark Mobile

Native mobile companion to the Daymark web app (`e:\atmosphere`).

**Understand your world through sunlight** — Explorer, Golden Hour Studio, Weather, Compare, and Year heatmap.

The web project is unchanged. This app reuses the same solar/daylight engines and Open-Meteo services with React Native UI.

## Stack

- Expo SDK 58 + Expo Router (tabs)
- React Native + TypeScript
- TanStack Query
- SunCalc (via `src/engines`)
- react-native-svg
- expo-location

## Run

```bash
cd e:\daymark-mobile
npm install --legacy-peer-deps
npx expo start
```

Then open in Expo Go (Android/iOS) or press `a` / `i` / `w`.

## Layout

```
src/
├── app/                 # Expo Router routes + providers
├── components/          # shared mobile UI
├── context/             # shared place + date
├── engines/             # pure solar / daylight / geometry (ported)
├── features/            # Explorer, Studio, Weather, Compare, Year
├── hooks/
├── services/            # Open-Meteo weather + geocoding
└── theme/
```
