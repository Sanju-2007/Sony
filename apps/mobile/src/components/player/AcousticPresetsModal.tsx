import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Sliders, X, Check, Activity } from "lucide-react-native";
import { typography, colors, spacing, radii } from "../../theme/tokens";

export type AcousticPresetId =
  | "CLEARAUDIO"
  | "WARM_VINYL"
  | "BASS_BOOST"
  | "VOCAL_PRESENCE"
  | "FLAT";

export interface AcousticProfile {
  id: AcousticPresetId;
  name: string;
  subtitle: string;
  gains: number[]; // dB gains across [60Hz, 250Hz, 1kHz, 4kHz, 16kHz]
}

export const ACOUSTIC_PROFILES: AcousticProfile[] = [
  {
    id: "CLEARAUDIO",
    name: "Sony ClearAudio+",
    subtitle: "High-definition treble clarity & punchy mids",
    gains: [3, 1, 0, 2, 4],
  },
  {
    id: "WARM_VINYL",
    name: "Warm Vinyl Simulation",
    subtitle: "Gentle rolled-off highs with saturated low-end",
    gains: [4, 3, 1, -1, -3],
  },
  {
    id: "BASS_BOOST",
    name: "Club & Bass Boost",
    subtitle: "Deep 60Hz resonance for synthwave & electronic",
    gains: [6, 4, 1, 0, 1],
  },
  {
    id: "VOCAL_PRESENCE",
    name: "Vocal / Karaoke Focus",
    subtitle: "Pushed 1kHz–4kHz speech harmonics for singing along",
    gains: [-2, 0, 4, 3, 0],
  },
  {
    id: "FLAT",
    name: "Flat Studio Reference",
    subtitle: "Unaltered acoustic reproduction",
    gains: [0, 0, 0, 0, 0],
  },
];

interface AcousticPresetsModalProps {
  visible: boolean;
  onClose: () => void;
  selectedPreset: AcousticPresetId;
  onSelectPreset: (presetId: AcousticPresetId) => void;
}

export function AcousticPresetsModal({
  visible,
  onClose,
  selectedPreset,
  onSelectPreset,
}: AcousticPresetsModalProps) {
  const palette = colors.light;

  const currentProfile =
    ACOUSTIC_PROFILES.find((p) => p.id === selectedPreset) || ACOUSTIC_PROFILES[0];

  const bands = ["60Hz", "250Hz", "1kHz", "4kHz", "16kHz"];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheetContainer, { backgroundColor: palette.background }]}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={[styles.handleBar, { backgroundColor: palette.border }]} />
            <View style={styles.titleRow}>
              <View style={styles.titleWithIcon}>
                <Sliders size={18} color={palette.textPrimary} style={{ marginRight: 6 }} />
                <Text style={[styles.sheetTitle, { color: palette.textPrimary }]}>Acoustic Presets & EQ</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <X size={20} color={palette.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 5-Band Equalizer Frequency Visualizer */}
          <View style={[styles.eqVisualizerCard, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
            <View style={styles.eqHeaderRow}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Activity size={13} color={palette.speaking} style={{ marginRight: 5 }} />
                <Text style={[styles.eqActiveName, { color: palette.textPrimary }]}>
                  {currentProfile.name}
                </Text>
              </View>
              <Text style={[styles.eqActiveMeta, { color: palette.textTertiary }]}>DSP Curve</Text>
            </View>

            <View style={styles.bandsRow}>
              {currentProfile.gains.map((gain, idx) => {
                // Map gain -6dB to +6dB onto height 14px to 54px
                const normalizedH = Math.max(12, Math.min(54, 30 + gain * 4));
                return (
                  <View key={idx} style={styles.bandCol}>
                    <Text style={[styles.gainText, { color: palette.textTertiary }]}>
                      {gain > 0 ? "+" + gain : gain}dB
                    </Text>
                    <View style={styles.bandTrack}>
                      <View
                        style={[
                          styles.bandFill,
                          {
                            height: normalizedH,
                            backgroundColor: palette.speaking,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.bandLabel, { color: palette.textSecondary }]}>
                      {bands[idx]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Preset Options */}
          <View style={styles.profilesList}>
            {ACOUSTIC_PROFILES.map((p) => {
              const isSelected = p.id === selectedPreset;
              return (
                <TouchableOpacity
                  key={p.id}
                  activeOpacity={0.8}
                  style={[
                    styles.profileCard,
                    {
                      backgroundColor: isSelected ? palette.textPrimary : palette.surface,
                      borderColor: isSelected ? palette.textPrimary : palette.borderSubtle,
                    },
                  ]}
                  onPress={() => onSelectPreset(p.id)}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.profileName,
                        { color: isSelected ? "#FFFFFF" : palette.textPrimary },
                      ]}
                    >
                      {p.name}
                    </Text>
                    <Text
                      style={[
                        styles.profileSubtitle,
                        { color: isSelected ? "rgba(255,255,255,0.7)" : palette.textTertiary },
                      ]}
                    >
                      {p.subtitle}
                    </Text>
                  </View>
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
    height: 520,
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
  eqVisualizerCard: {
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  eqHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  eqActiveName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  eqActiveMeta: {
    fontSize: 10,
  },
  bandsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 80,
    paddingHorizontal: spacing.xs,
  },
  bandCol: {
    alignItems: "center",
    width: 44,
  },
  gainText: {
    fontSize: 9,
    marginBottom: 4,
  },
  bandTrack: {
    width: 6,
    height: 54,
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 3,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  bandFill: {
    width: "100%",
    borderRadius: 3,
  },
  bandLabel: {
    fontSize: 9,
    fontWeight: typography.weights.medium,
    marginTop: 6,
  },
  profilesList: {
    gap: 8,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  profileName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  profileSubtitle: {
    fontSize: 10,
    marginTop: 2,
  },
});
