import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Headphones, ArrowRight, Sparkles } from "lucide-react-native";
import { DotWaveBackground } from "../src/components/particles/DotWaveBackground";
import { ThemeToggleButton } from "../src/components/theme/ThemeToggleButton";
import { useThemeStore } from "../src/store/themeStore";
import { typography, radii, spacing } from "../src/theme/tokens";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function OpeningIntroScreen() {
  const router = useRouter();
  const { isDark, palette } = useThemeStore();

  // Animation values
  const dropAnim = useRef(new Animated.Value(-260)).current; // Drop from above
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const slideSidewaysAnim = useRef(new Animated.Value(0)).current; // Slide left
  const nameOpacity = useRef(new Animated.Value(0)).current; // Name fade in
  const nameSlideAnim = useRef(new Animated.Value(30)).current; // Name slide in from right
  const screenFade = useRef(new Animated.Value(1)).current;

  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    // Sequence of animations
    // 1. Drop down logo (0ms -> 700ms)
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(dropAnim, {
        toValue: 0,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Pause in center, then slide sideways and reveal app name (at 1200ms)
    const holdTimer = setTimeout(() => {
      Animated.parallel([
        // Logo slides left
        Animated.timing(slideSidewaysAnim, {
          toValue: -75,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // App name appears beside logo
        Animated.timing(nameOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(nameSlideAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 1200);

    // 3. Smooth transition to Home screen (at 2800ms)
    const navTimer = setTimeout(() => {
      handleProceedToHome();
    }, 2800);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(navTimer);
    };
  }, []);

  const handleProceedToHome = () => {
    if (hasNavigated) return;
    setHasNavigated(true);
    Animated.timing(screenFade, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start(() => {
      router.replace("/(tabs)");
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: palette.background }]}
      edges={["top", "bottom"]}
    >
      {/* 3D Dot Wave Canvas Background */}
      <DotWaveBackground />

      <Animated.View style={[styles.content, { opacity: screenFade }]}>
        {/* Top Header Controls */}
        <View style={styles.topBar}>
          <ThemeToggleButton />
          <TouchableOpacity
            style={[
              styles.skipBtn,
              {
                backgroundColor: palette.surface,
                borderColor: palette.borderSubtle,
              },
            ]}
            onPress={handleProceedToHome}
            accessibilityLabel="Skip intro to Home"
          >
            <Text style={[styles.skipText, { color: palette.textSecondary }]}>
              Explore Home
            </Text>
            <ArrowRight size={13} color={palette.textSecondary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {/* Center Stage Animation */}
        <View style={styles.centerStage}>
          {/* Animated Logo Container */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [
                  { translateY: dropAnim },
                  { translateX: slideSidewaysAnim },
                ],
                opacity: logoOpacity,
              },
            ]}
          >
            <View
              style={[
                styles.emblemCircle,
                {
                  backgroundColor: palette.accent,
                  shadowColor: isDark ? "#FFFFFF" : "#000000",
                  shadowOpacity: isDark ? 0.3 : 0.15,
                },
              ]}
            >
              <Headphones size={38} color={palette.accentInverted} />
            </View>
          </Animated.View>

          {/* Animated App Name Container (Beside the Logo) */}
          <Animated.View
            style={[
              styles.nameContainer,
              {
                opacity: nameOpacity,
                transform: [{ translateX: nameSlideAnim }],
              },
            ]}
          >
            <Text
              style={[
                styles.appNameText,
                { color: palette.textPrimary },
              ]}
            >
              SONY SOUND
            </Text>
            <Text
              style={[
                styles.taglineText,
                { color: palette.textTertiary },
              ]}
            >
              Social Music & Realtime Presence
            </Text>
          </Animated.View>
        </View>

        {/* Bottom Hint */}
        <View style={styles.bottomHintBox}>
          <Text style={[styles.hintText, { color: palette.textTertiary }]}>
            “Let’s listen together even when we’re far apart”
          </Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    zIndex: 2,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skipBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  skipText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  centerStage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  logoContainer: {
    position: "absolute",
    zIndex: 10,
  },
  emblemCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 12,
  },
  nameContainer: {
    position: "absolute",
    left: "50%",
    marginLeft: 15,
    width: 240,
    justifyContent: "center",
    zIndex: 9,
  },
  appNameText: {
    fontSize: typography.sizes["2xl"],
    fontWeight: "900",
    letterSpacing: 3,
    marginBottom: 4,
  },
  taglineText: {
    fontSize: typography.sizes.xs,
    fontWeight: "500",
    letterSpacing: 0.6,
  },
  bottomHintBox: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  hintText: {
    fontSize: typography.sizes.xs,
    fontStyle: "italic",
    letterSpacing: 0.5,
    textAlign: "center",
  },
});
