import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, View } from 'react-native'
import { QueryProvider } from '@/app/providers/QueryProvider'
import { IntroSplash } from '@/components/intro/IntroSplash'
import { PlaceProvider } from '@/context/PlaceContext'
import { colors } from '@/theme/colors'

export default function RootLayout() {
  return (
    <QueryProvider>
      <PlaceProvider>
        <View style={styles.root}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.night950 },
            }}
          >
            <Stack.Screen name="(tabs)" />
          </Stack>
          {/* Plays on every cold start (app opened after closed). */}
          <IntroSplash />
        </View>
      </PlaceProvider>
    </QueryProvider>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.night950,
  },
})
