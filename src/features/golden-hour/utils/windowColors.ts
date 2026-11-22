import type { LightWindowId } from '@/engines/daylight'

export function getWindowAccent(id: LightWindowId): string {
  switch (id) {
    case 'golden-morning':
    case 'golden-evening':
      return 'text-sun-300'
    case 'blue-morning':
    case 'blue-evening':
      return 'text-twilight-300'
    case 'civil-dawn':
    case 'civil-dusk':
      return 'text-twilight-400'
    case 'nautical-dawn':
    case 'nautical-dusk':
      return 'text-twilight-500'
    case 'astro-dawn':
    case 'astro-dusk':
      return 'text-mist-300'
    case 'daylight':
      return 'text-sun-400'
    default:
      return 'text-mist-100'
  }
}

export function getWindowBandColor(id: LightWindowId): string {
  switch (id) {
    case 'golden-morning':
    case 'golden-evening':
      return '#f0a43a'
    case 'blue-morning':
    case 'blue-evening':
      return '#6b7fd7'
    case 'civil-dawn':
    case 'civil-dusk':
      return '#8fa0d9'
    case 'nautical-dawn':
    case 'nautical-dusk':
      return '#4a5580'
    case 'astro-dawn':
    case 'astro-dusk':
      return '#2a3148'
    case 'daylight':
      return '#ffc45a'
    default:
      return '#6b5f54'
  }
}
