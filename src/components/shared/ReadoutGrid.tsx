import { StyleSheet, Text, View } from 'react-native'
import { colors, spacing } from '@/theme/colors'

export type ReadoutItem = {
  label: string
  value: string
  hint?: string
}

export function ReadoutGrid({ items }: { items: ReadoutItem[] }) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.label} style={styles.cell}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.value}>{item.value}</Text>
          {item.hint ? <Text style={styles.hint}>{item.hint}</Text> : null}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  cell: {
    width: '46%',
    gap: 2,
  },
  label: {
    color: colors.mist500,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    color: colors.mist50,
    fontSize: 18,
    fontWeight: '700',
  },
  hint: {
    color: colors.mist400,
    fontSize: 12,
  },
})
