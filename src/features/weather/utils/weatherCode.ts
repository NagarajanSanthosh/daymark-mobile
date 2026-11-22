/** WMO weather interpretation codes (Open-Meteo). */
export function getWeatherSkyStory(code: number | null): {
  label: string
  story: string
} {
  if (code == null) {
    return { label: 'Unknown', story: 'Sky conditions unavailable.' }
  }

  if (code === 0) {
    return { label: 'Clear', story: 'Hard light and crisp shadows — great for defined golden edges.' }
  }
  if (code === 1) {
    return { label: 'Mainly clear', story: 'Mostly open sky with a few soft clouds.' }
  }
  if (code === 2) {
    return {
      label: 'Partly cloudy',
      story: 'Mixed light — watch for sun breaks during golden hour.',
    }
  }
  if (code === 3) {
    return {
      label: 'Overcast',
      story: 'Soft, even light — golden color may mute; blue hour still usable.',
    }
  }
  if (code === 45 || code === 48) {
    return { label: 'Fog', story: 'Atmosphere-heavy — silhouettes and glow scenes shine.' }
  }
  if (code >= 51 && code <= 57) {
    return { label: 'Drizzle', story: 'Wet streets and reflections; keep gear covered.' }
  }
  if (code >= 61 && code <= 67) {
    return { label: 'Rain', story: 'Shoot windows may wash out; look for breaks after showers.' }
  }
  if (code >= 71 && code <= 77) {
    return { label: 'Snow', story: 'Bright bounce light — expose carefully near white ground.' }
  }
  if (code >= 80 && code <= 82) {
    return { label: 'Showers', story: 'Patchy rain — timing matters more than the forecast average.' }
  }
  if (code >= 85 && code <= 86) {
    return { label: 'Snow showers', story: 'Brief whiteouts possible; contrast can spike quickly.' }
  }
  if (code >= 95) {
    return { label: 'Thunder', story: 'Stay safe first — dramatic skies if you can shoot from cover.' }
  }

  return { label: 'Mixed', story: 'Variable sky — check the hourly strip before you head out.' }
}
