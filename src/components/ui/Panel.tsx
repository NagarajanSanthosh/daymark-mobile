import type { ReactNode } from 'react'
import { StyleSheet, View, type ViewStyle } from 'react-native'
import { colors, spacing } from '@/theme/colors'

type PanelProps = {
  children: ReactNode
  style?: ViewStyle
  tone?: 'dark' | 'light'
}

export function Panel({ children, style, tone = 'dark' }: PanelProps) {
  return (
    <View style={[styles.base, tone === 'light' ? styles.light : styles.dark, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
  },
  dark: {
    backgroundColor: 'rgba(17, 24, 39, 0.92)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  light: {
    backgroundColor: colors.mist50,
    borderColor: 'rgba(26, 36, 56, 0.12)',
  },
})
