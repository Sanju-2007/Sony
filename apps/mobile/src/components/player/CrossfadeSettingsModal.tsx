import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Shuffle, X, Check, Zap } from "lucide-react-native";
import { colors, spacing, typography, radii } from "../../theme/tokens";
import { usePlaybackStore } from "../../store/playbackStore";
import { DJCrossfadeEngine } from "@sony/music-core";
import { CrossfadeDurationSec } from "@sony/types";

interface CrossfadeSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CrossfadeSettingsModal: React.FC<CrossfadeSettingsModalProps> = ({
  visible,
  onClose,
}) => {
  const palette = colors.dark;
  const {
    crossfade,
    setCrossfadeDuration,
    toggleCrossfadeEnabled,
    toggleSmartCue,
  } = usePlaybackStore();

  const [previewProgress, setPreviewProgress] = useState(0.5); // Midpoint default

  const gains = DJCrossfadeEngine.calculateGains(previewProgress, crossfade.curve);

  const durationOptions: { label: string; duration: CrossfadeDurationSec; description: string }[] = [
    { label: "Off (0s)", duration: 0, description: "Instant cut between consecutive tracks" },
    { label: "3s Subtle", duration: 3, description: "Brief smooth overlap for ambient transitions" },
    { label: "6s Standard", duration: 6, description: "Balanced DJ crossfade with constant loudness" },
    { label: "9s Club Mix", duration: 9, description: "Extended energetic blend between beats" },
    { label: "12s Atmospheric", duration: 12, description: "Deep cinematic cross-drift for electronic sets" },
  ];

  const previewSteps = [0.0, 0.25, 0.5, 0.75, 1.0];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheetContainer, { backgroundColor: palette.background }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleGroup}>
              <View style={[styles.iconBadge, { backgroundColor: palette.surface }]}>
                <Shuffle size={18} color={palette.textPrimary} />
              </View>
              <View>
                <Text style={[styles.title, { color: palette.textPrimary }]}>DJ Crossfade Engine</Text>
                <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
                  Equal-power seamless track transitions
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityLabel="Close Crossfade Modal"
            >
              <X size={20} color={palette.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Master Enable Banner */}
          <View style={[styles.bannerRow, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
            <View style={styles.bannerInfo}>
              <Text style={[styles.bannerTitle, { color: palette.textPrimary }]}>Crossfade Transitions</Text>
              <Text style={[styles.bannerSubtitle, { color: palette.textSecondary }]}>
                {crossfade.enabled
                  ? `Active (${crossfade.durationSec}s Equal-Power)`
                  : "Disabled (Gapless cut)"}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                { backgroundColor: palette.surfaceHover, borderColor: palette.borderSubtle },
                crossfade.enabled && { backgroundColor: palette.accent, borderColor: palette.accent },
              ]}
              onPress={toggleCrossfadeEnabled}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  { color: palette.textSecondary },
                  crossfade.enabled && { color: palette.background },
                ]}
              >
                {crossfade.enabled ? "ENABLED" : "DISABLED"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Visual Dual-Deck Crossfade Meter */}
            <View style={[styles.meterContainer, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
              <View style={styles.meterHeader}>
                <Text style={[styles.meterTitle, { color: palette.textTertiary }]}>TRANSITION ENERGY MONITOR</Text>
                <Text style={[styles.meterAcousticPower, { color: palette.speaking }]}>
                  Conserved Power: {(gains.totalPower * 100).toFixed(0)}%
                </Text>
              </View>

              <View style={styles.decksRow}>
                {/* Deck A (Outgoing) */}
                <View style={[styles.deckCard, { backgroundColor: palette.card }]}>
                  <Text style={[styles.deckLabel, { color: palette.textSecondary }]}>DECK A (Outgoing)</Text>
                  <Text style={[styles.deckPercent, { color: palette.textPrimary }]}>
                    {Math.round(gains.deckAGain * 100)}%
                  </Text>
                  <View style={[styles.barTrack, { backgroundColor: palette.borderSubtle }]}>
                    <View
                      style={[
                        styles.barFillA,
                        { width: `${Math.round(gains.deckAGain * 100)}%`, backgroundColor: palette.accent },
                      ]}
                    />
                  </View>
                </View>

                {/* Deck B (Incoming) */}
                <View style={[styles.deckCard, { backgroundColor: palette.card }]}>
                  <Text style={[styles.deckLabel, { color: palette.textSecondary }]}>DECK B (Incoming)</Text>
                  <Text style={[styles.deckPercent, { color: palette.textPrimary }]}>
                    {Math.round(gains.deckBGain * 100)}%
                  </Text>
                  <View style={[styles.barTrack, { backgroundColor: palette.borderSubtle }]}>
                    <View
                      style={[
                        styles.barFillB,
                        { width: `${Math.round(gains.deckBGain * 100)}%`, backgroundColor: "#60A5FA" },
                      ]}
                    />
                  </View>
                </View>
              </View>

              {/* Interactive Preview Slider Buttons */}
              <View style={styles.previewSliderRow}>
                <Text style={[styles.previewPrompt, { color: palette.textSecondary }]}>Simulate Crossfade Position:</Text>
                <View style={styles.previewStepsContainer}>
                  {previewSteps.map((step) => (
                    <TouchableOpacity
                      key={step}
                      style={[
                        styles.previewStepBtn,
                        { backgroundColor: palette.surfaceHover },
                        previewProgress === step && { backgroundColor: palette.border },
                      ]}
                      onPress={() => setPreviewProgress(step)}
                    >
                      <Text
                        style={[
                          styles.previewStepText,
                          { color: palette.textSecondary },
                          previewProgress === step && { color: palette.textPrimary, fontWeight: typography.weights.bold },
                        ]}
                      >
                        {step === 0 ? "Start" : step === 1 ? "End" : `${Math.round(step * 100)}%`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Duration Selector */}
            <Text style={[styles.sectionTitle, { color: palette.textTertiary }]}>TRANSITION DURATION</Text>
            {durationOptions.map((opt) => {
              const isSelected = crossfade.durationSec === opt.duration;
              return (
                <TouchableOpacity
                  key={opt.duration}
                  style={[
                    styles.optionCard,
                    { backgroundColor: palette.surface, borderColor: palette.borderSubtle },
                    isSelected && { borderColor: palette.accent, backgroundColor: palette.surfaceHover },
                  ]}
                  onPress={() => setCrossfadeDuration(opt.duration)}
                >
                  <View style={styles.optionLeft}>
                    <View style={[styles.radioCircle, { borderColor: palette.textTertiary }, isSelected && { borderColor: palette.accent }]}>
                      {isSelected && <View style={[styles.radioInner, { backgroundColor: palette.accent }]} />}
                    </View>
                    <View>
                      <Text style={[styles.optionLabel, { color: palette.textPrimary }, isSelected && { fontWeight: typography.weights.bold }]}>
                        {opt.label}
                      </Text>
                      <Text style={[styles.optionDesc, { color: palette.textSecondary }]}>{opt.description}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Smart Beat-Drop Cue Toggle */}
            <TouchableOpacity
              style={[styles.smartCueRow, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}
              onPress={toggleSmartCue}
              activeOpacity={0.8}
            >
              <View style={styles.smartCueLeft}>
                <Zap
                  size={18}
                  color={crossfade.smartCue ? "#FBBF24" : palette.textTertiary}
                />
                <View>
                  <Text style={[styles.smartCueTitle, { color: palette.textPrimary }]}>Smart Beat-Drop Cue</Text>
                  <Text style={[styles.smartCueDesc, { color: palette.textSecondary }]}>
                    Aligns transition start with outgoing outro phrasing
                  </Text>
                </View>
              </View>
              {crossfade.smartCue ? (
                <Check size={20} color={palette.textPrimary} />
              ) : (
                <View style={[styles.emptyBox, { borderColor: palette.textTertiary }]} />
              )}
            </TouchableOpacity>

            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.78)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    maxHeight: "85%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  closeButton: {
    padding: spacing.xs,
  },
  bannerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  bannerInfo: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  bannerSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  toggleBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.8,
  },
  scrollContent: {
    marginTop: spacing.xs,
  },
  meterContainer: {
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  meterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  meterTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.1,
  },
  meterAcousticPower: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
  },
  decksRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  deckCard: {
    flex: 1,
    borderRadius: radii.sm,
    padding: spacing.sm,
  },
  deckLabel: {
    fontSize: 10,
    fontWeight: typography.weights.medium,
  },
  deckPercent: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginVertical: 4,
  },
  barTrack: {
    height: 4,
    borderRadius: radii.full,
    overflow: "hidden",
  },
  barFillA: {
    height: "100%",
  },
  barFillB: {
    height: "100%",
  },
  previewSliderRow: {
    marginTop: spacing.xs,
  },
  previewPrompt: {
    fontSize: 10,
    marginBottom: 6,
  },
  previewStepsContainer: {
    flexDirection: "row",
    gap: 4,
  },
  previewStepBtn: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: radii.sm,
    alignItems: "center",
  },
  previewStepText: {
    fontSize: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.1,
    marginBottom: spacing.sm,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  optionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  optionDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  smartCueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.xs,
    borderWidth: 1,
  },
  smartCueLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  smartCueTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  smartCueDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  emptyBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
  },
});
