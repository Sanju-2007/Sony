import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Sparkles, Heart, Zap, Disc3, X } from "lucide-react-native";
import { SongDedication } from "@sony/types";
import { colors, radii, typography, spacing } from "../../theme/tokens";
import { useRoomThemeStore } from "../../store/roomThemeStore";

interface SongDedicationBannerProps {
  dedication: SongDedication;
}

export const SongDedicationBanner: React.FC<SongDedicationBannerProps> = ({
  dedication,
}) => {
  const { dismissDedication, theme } = useRoomThemeStore();

  const getStyleProps = () => {
    switch (dedication.badgeStyle) {
      case "GOLDEN":
        return {
          icon: <Sparkles size={14} color="#F59E0B" />,
          borderColor: "rgba(245, 158, 11, 0.4)",
          bg: "rgba(245, 158, 11, 0.12)",
          accentColor: "#F59E0B",
        };
      case "NEON":
        return {
          icon: <Zap size={14} color="#38BDF8" />,
          borderColor: "rgba(56, 189, 248, 0.4)",
          bg: "rgba(56, 189, 248, 0.12)",
          accentColor: "#38BDF8",
        };
      case "HEART":
        return {
          icon: <Heart size={14} color="#EC4899" />,
          borderColor: "rgba(236, 72, 153, 0.4)",
          bg: "rgba(236, 72, 153, 0.12)",
          accentColor: "#EC4899",
        };
      case "CLASSIC":
      default:
        return {
          icon: <Disc3 size={14} color={theme.accent} />,
          borderColor: theme.border,
          bg: theme.surface,
          accentColor: theme.textPrimary,
        };
    }
  };

  const styleProps = getStyleProps();

  return (
    <View
      style={[
        styles.bannerContainer,
        {
          backgroundColor: styleProps.bg,
          borderColor: styleProps.borderColor,
        },
      ]}
    >
      <View style={styles.leftRow}>
        <View style={styles.iconCircle}>{styleProps.icon}</View>
        <View style={styles.textContainer}>
          <View style={styles.metaRow}>
            <Text style={[styles.fromText, { color: styleProps.accentColor }]}>
              {dedication.fromUserName}
            </Text>
            <Text style={styles.toArrow}>➔</Text>
            <Text style={styles.toText}>{dedication.toUserName}</Text>
          </View>
          <Text style={styles.messageText} numberOfLines={2}>
            "{dedication.message}"
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={dismissDedication}
        style={styles.closeBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <X size={14} color={colors.dark.textTertiary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    marginVertical: spacing.xs,
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  fromText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
  },
  toArrow: {
    fontSize: 10,
    color: colors.dark.textTertiary,
  },
  toText: {
    fontSize: 11,
    color: colors.dark.textSecondary,
    fontWeight: typography.weights.medium,
  },
  messageText: {
    fontSize: 11,
    color: colors.dark.textPrimary,
    fontStyle: "italic",
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
    marginLeft: spacing.xs,
  },
});
