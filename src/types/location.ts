export type Location = {
  id: string
  name: string
  admin?: string
  country: string
  latitude: number
  longitude: number
  timezone: string
}

export function formatLocationLabel(location: Location): string {
  const parts = [location.name]
  if (location.admin) parts.push(location.admin)
  parts.push(location.country)
  return parts.join(', ')
}
