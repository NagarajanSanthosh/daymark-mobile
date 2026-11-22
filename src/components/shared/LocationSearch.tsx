import { useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useLocationSearch } from '@/hooks/useLocationSearch'
import { colors, spacing } from '@/theme/colors'
import { formatLocationLabel, type Location } from '@/types/location'

type LocationSearchProps = {
  value: Location
  onChange: (location: Location) => void
}

export function LocationSearch({ value, onChange }: LocationSearchProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const { results, searching } = useLocationSearch(query)

  function select(location: Location) {
    onChange(location)
    setQuery('')
    setOpen(false)
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.field}>
        <TextInput
          value={query}
          onChangeText={(text) => {
            setQuery(text)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={formatLocationLabel(value)}
          placeholderTextColor={colors.mist400}
          style={styles.input}
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="search"
        />
        {searching ? <ActivityIndicator color={colors.sun500} size="small" /> : null}
      </View>

      {open ? (
        <View style={styles.list}>
          {results.length === 0 ? (
            <Text style={styles.empty}>No matching cities</Text>
          ) : (
            results.slice(0, 8).map((location) => (
              <Pressable
                key={location.id}
                style={styles.item}
                onPress={() => select(location)}
              >
                <Text style={styles.itemTitle}>{location.name}</Text>
                <Text style={styles.itemMeta}>
                  {[location.admin, location.country].filter(Boolean).join(' · ')}
                </Text>
              </Pressable>
            ))
          )}
          <Pressable onPress={() => setOpen(false)} style={styles.close}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    zIndex: 20,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(10, 16, 28, 0.85)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.mist100,
    fontSize: 14,
    paddingVertical: spacing.xs,
  },
  list: {
    marginTop: spacing.sm,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: colors.night800,
    overflow: 'hidden',
  },
  item: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  itemTitle: {
    color: colors.mist50,
    fontSize: 14,
    fontWeight: '600',
  },
  itemMeta: {
    color: colors.mist400,
    fontSize: 12,
    marginTop: 2,
  },
  empty: {
    color: colors.mist400,
    padding: spacing.md,
    fontSize: 13,
  },
  close: {
    padding: spacing.md,
    alignItems: 'center',
  },
  closeText: {
    color: colors.sun400,
    fontSize: 13,
    fontWeight: '600',
  },
})
