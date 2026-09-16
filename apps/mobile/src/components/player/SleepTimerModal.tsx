import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Moon, X, Clock, Check, PowerOff } from "lucide-react-native";
import { typography, colors, spacing, radii } from "../../theme/tokens";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface SleepTimerModalProps {
  visible: boolean;
  onClose: () => void;
  onTimerSet: (minutes: number | "track_end") => void;
  onCancelTimer: () => void;
  activeTimerMinutes: number | null;
  remainingSeconds: number | null;
}

export function SleepTimerModal({
  visible,
  onClose,
  onTimerSet,
  onCancelTimer,
  activeTimerMinutes,
  remainingSeconds,
}: SleepTimerModalProps) {
  const palette = colors.light;

  const options = [
    { label: "15 minutes", value: 15 },
    { label: "30 minutes", value: 30 },
    { label: "45 minutes", value: 45 },
    { label: "60 minutes", value: 60 },
    { label: "End of current track", value: "track_end" as const },
  ];

  const formatRemaining = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheetContainer, { backgroundColor: palette.background }]}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={[styles.handleBar, { backgroundColor: palette.border }]} />
            <View style={styles.titleRow}>
              <View style={styles.titleWithIcon}>
                <Moon size={18} color={palette.textPrimary} style={{ marginRight: 6 }} />
                <Text style={[styles.sheetTitle, { color: palette.textPrimary }]}>Sleep Timer</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <X size={20} color={palette.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Active Timer Status Banner */}
          {remainingSeconds !== null && remainingSeconds > 0 && (
            <View style={[styles.activeBanner, { backgroundColor: palette.surface, borderColor: palette.speaking }]}>
              <Clock size={16} color={palette.speaking} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.activeBannerTitle, { color: palette.textPrimary }]}>
                  Sleep timer running
                </Text>
                <Text style={[styles.activeBannerDesc, { color: palette.textTertiary }]}>
                  Music stops in {formatRemaining(remainingSeconds)} · Smooth 60s fade out
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: palette.border }]}
                onPress={() => {
                  onCancelTimer();
                  onClose();
                }}
              >
                <PowerOff size={13} color={palette.duckingIndicator} />
              </TouchableOpacity>
            </View>
          )}

          {/* Options List */}
          <View style={styles.optionsList}>
            {options.map((opt) => {
              const isSelected = activeTimerMinutes === opt.value;
              return (
                <TouchableOpacity
                  key={String(opt.value)}
                  activeOpacity={0.8}
                  style={[
                    styles.optionRow,
                    {
                      backgroundColor: isSelected ? palette.textPrimary : palette.surface,
                      borderColor: isSelected ? palette.textPrimary : palette.borderSubtle,
                    },
                  ]}
                  onPress={() => {
                    onTimerSet(opt.value);
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: isSelected ? "#FFFFFF" : palette.textPrimary },
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {isSelected && <Check size={16} color="#FFFFFF" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    height: 400,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: 30,
  },
  sheetHeader: {
    alignItems: "center",
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  titleWithIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  sheetTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.tight,
  },
  closeBtn: {
    padding: 6,
  },
  activeBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  activeBannerTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  activeBannerDesc: {
    fontSize: 10,
    marginTop: 1,
  },
  cancelBtn: {
    padding: 6,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  optionsList: {
    gap: 8,
    marginTop: spacing.xs,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  optionText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
});
