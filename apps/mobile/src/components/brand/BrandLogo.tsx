import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Disc3, Radio, Headphones, Sparkles } from "lucide-react-native";
import { useThemeStore } from "../../store/themeStore";
import { typography, radii, spacing } from "../../theme/tokens";

interface BrandLogoProps {
  size?: number;
  showText?: boolean;
  tagline?: boolean;
  animated?: boolean;
}

export function BrandLogo({
  size = 56,
  showText = false,
  tagline = false,
}: BrandLogoProps) {
  const { palette, isDark } = useThemeStore();

  const emblemSize = size;
  const iconSize = Math.round(size * 0.52);

  return (
    <View style={styles.container}>
      {/* Stylized Minimalist Emblem */}
      <View
        style={[
          styles.emblemWrapper,
          {
            width: emblemSize,
            height: emblemSize,
            borderRadius: emblemSize / 2,
            backgroundColor: palette.accent,
            shadowColor: isDark ? "#FFFFFF" : "#000000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: isDark ? 0.25 : 0.15,
            shadowRadius: 16,
            elevation: 10,
          },
        ]}
      >
        <Headphones size={iconSize} color={palette.accentInverted} />
      </View>

      {/* Brand Wordmark (when revealed) */}
      {showText && (
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.brandName,
              { color: palette.textPrimary, fontSize: Math.round(size * 0.44) },
            ]}
          >
            SONY SOUND
          </Text>
          {tagline && (
            <Text
              style={[
                styles.brandTagline,
                { color: palette.textTertiary, fontSize: Math.max(10, Math.round(size * 0.2)) },
              ]}
            >
              Social Listening & Realtime Presence
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  emblemWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    marginLeft: 14,
    justifyContent: "center",
  },
  brandName: {
    fontWeight: "900",
    letterSpacing: 2,
  },
  brandTagline: {
    fontWeight: "500",
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
