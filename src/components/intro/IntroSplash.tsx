import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '@/theme/colors'

/**
 * Startup intro: sun rises → moon → Daymark brand → fade out.
 * Plays on every cold start (app opened after closed), not first-visit only.
 */
export function IntroSplash() {
  const insets = useSafeAreaInsets()
  const [visible, setVisible] = useState(true)
  const [reduced, setReduced] = useState(false)

  const overlayOpacity = useRef(new Animated.Value(1)).current
  const sunY = useRef(new Animated.Value(140)).current
  const sunOpacity = useRef(new Animated.Value(0)).current
  const sunScale = useRef(new Animated.Value(0.7)).current
  const moonOpacity = useRef(new Animated.Value(0)).current
  const moonScale = useRef(new Animated.Value(0.8)).current
  const moonRotate = useRef(new Animated.Value(-12)).current
  const moonY = useRef(new Animated.Value(0)).current
  const brandOpacity = useRef(new Animated.Value(0)).current
  const brandY = useRef(new Animated.Value(12)).current
  const glowWarm = useRef(new Animated.Value(1)).current

  const finish = useCallback(() => {
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: reduced ? 200 : 550,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setVisible(false)
    })
  }, [overlayOpacity, reduced])

  useEffect(() => {
    let mounted = true
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduced(enabled)
    })
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduced,
    )
    return () => {
      mounted = false
      sub.remove()
    }
  }, [])

  useEffect(() => {
    if (!visible) return

    if (reduced) {
      brandOpacity.setValue(1)
      brandY.setValue(0)
      moonOpacity.setValue(0)
      sunOpacity.setValue(0)
      const done = setTimeout(() => finish(), 900)
      return () => clearTimeout(done)
    }

    // Sun rise
    Animated.parallel([
      Animated.spring(sunY, {
        toValue: 0,
        stiffness: 120,
        damping: 18,
        useNativeDriver: true,
      }),
      Animated.timing(sunOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(sunScale, {
        toValue: 1,
        stiffness: 120,
        damping: 18,
        useNativeDriver: true,
      }),
    ]).start()

    const toMoon = setTimeout(() => {
      Animated.parallel([
        Animated.timing(sunOpacity, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(sunScale, {
          toValue: 0.85,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(glowWarm, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.spring(moonOpacity, {
          toValue: 1,
          stiffness: 160,
          damping: 20,
          useNativeDriver: true,
        }),
        Animated.spring(moonScale, {
          toValue: 1,
          stiffness: 160,
          damping: 20,
          useNativeDriver: true,
        }),
        Animated.spring(moonRotate, {
          toValue: 0,
          stiffness: 160,
          damping: 20,
          useNativeDriver: true,
        }),
      ]).start()
    }, 1600)

    const toBrand = setTimeout(() => {
      Animated.parallel([
        Animated.spring(moonY, {
          toValue: -28,
          stiffness: 160,
          damping: 20,
          useNativeDriver: true,
        }),
        Animated.timing(brandOpacity, {
          toValue: 1,
          duration: 450,
          easing: Easing.bezier(0.22, 1, 0.36, 1),
          useNativeDriver: true,
        }),
        Animated.timing(brandY, {
          toValue: 0,
          duration: 450,
          easing: Easing.bezier(0.22, 1, 0.36, 1),
          useNativeDriver: true,
        }),
      ]).start()
    }, 3000)

    const done = setTimeout(() => finish(), 4200)

    return () => {
      clearTimeout(toMoon)
      clearTimeout(toBrand)
      clearTimeout(done)
    }
  }, [
    visible,
    reduced,
    finish,
    sunY,
    sunOpacity,
    sunScale,
    moonOpacity,
    moonScale,
    moonRotate,
    moonY,
    brandOpacity,
    brandY,
    glowWarm,
  ])

  if (!visible) return null

  const moonRotateDeg = moonRotate.interpolate({
    inputRange: [-12, 0],
    outputRange: ['-12deg', '0deg'],
  })

  return (
    <Animated.View
      pointerEvents="auto"
      accessibilityViewIsModal
      accessibilityLabel="Daymark introduction"
      style={[styles.overlay, { opacity: overlayOpacity }]}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.glowWarm, { opacity: glowWarm }]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glowCool,
          {
            opacity: glowWarm.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            }),
          },
        ]}
      />

      <View pointerEvents="none" style={styles.horizon} />

      {!reduced ? (
        <View style={styles.stage}>
          <Animated.View
            style={[
              styles.sunWrap,
              {
                opacity: sunOpacity,
                transform: [{ translateY: sunY }, { scale: sunScale }],
              },
            ]}
          >
            <View style={styles.sunGlowOuter} />
            <View style={styles.sunGlowInner} />
            <View style={styles.sun} />
          </Animated.View>

          <Animated.View
            style={[
              styles.moonWrap,
              {
                opacity: moonOpacity,
                transform: [
                  { translateY: moonY },
                  { scale: moonScale },
                  { rotate: moonRotateDeg },
                ],
              },
            ]}
          >
            <View style={styles.moonGlow} />
            <View style={styles.moon}>
              <View style={styles.moonShadow} />
            </View>
          </Animated.View>
        </View>
      ) : null}

      <Animated.View
        style={[
          styles.brand,
          {
            opacity: brandOpacity,
            transform: [{ translateY: brandY }],
          },
        ]}
      >
        <Text style={styles.title}>Daymark</Text>
        <Text style={styles.subtitle}>Solar observatory</Text>
      </Animated.View>

      <Pressable
        onPress={finish}
        style={[styles.skip, { bottom: Math.max(20, insets.bottom + 12) }]}
        accessibilityRole="button"
        accessibilityLabel="Skip introduction"
      >
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
    backgroundColor: '#07060a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowWarm: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(240,164,58,0.16)',
  },
  glowCool: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(109,126,184,0.14)',
  },
  horizon: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: '28%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(232,237,245,0.25)',
  },
  stage: {
    height: 180,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunGlowOuter: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: 'rgba(240,164,58,0.28)',
  },
  sunGlowInner: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 999,
    backgroundColor: 'rgba(255,210,122,0.35)',
  },
  sun: {
    width: 88,
    height: 88,
    borderRadius: 999,
    backgroundColor: colors.sun500,
    borderWidth: 2,
    borderColor: colors.sun300,
    shadowColor: colors.sun500,
    shadowOpacity: 0.55,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  moonWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moonGlow: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 999,
    backgroundColor: 'rgba(139,154,232,0.22)',
  },
  moon: {
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: colors.mist100,
    overflow: 'hidden',
    shadowColor: '#b7c4ef',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  moonShadow: {
    position: 'absolute',
    top: 4,
    right: 8,
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: 'rgba(7,6,10,0.85)',
  },
  brand: {
    marginTop: 24,
    alignItems: 'center',
  },
  title: {
    color: colors.mist50,
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: 8,
    color: colors.mist400,
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  skip: {
    position: 'absolute',
    right: 20,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(10,16,28,0.75)',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  skipText: {
    color: colors.mist300,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
})
