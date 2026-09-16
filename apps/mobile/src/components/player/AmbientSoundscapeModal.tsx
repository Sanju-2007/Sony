import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { CloudRain, X, Check, Volume2, Play, Pause, Radio } from "lucide-react-native";
import { colors, spacing, typography, radii } from "../../theme/tokens";
import { usePlaybackStore } from "../../store/playbackStore";
import { AMBIENT_SOUNDSCAPES } from "@sony/music-core";
import { AmbientSoundscapeType } from "@sony/types";

interface AmbientSoundscapeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AmbientSoundscapeModal: React.FC<AmbientSoundscapeModalProps> = ({
  visible,
  onClose,
}) => {
  const palette = colors.dark;
  const { soundscape, setSoundscapeType, setSoundscapeVolume, toggleSoundscapePlay } =
    usePlaybackStore();

  const handleSelectType = (type: AmbientSoundscapeType) => {
    if (soundscape.type === type && soundscape.isPlaying) {
      toggleSoundscapePlay();
    } else {
      setSoundscapeType(type);
    }
  };

  const volumeLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

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
                <CloudRain size={18} color={palette.textPrimary} />
              </View>
              <View>
                <Text style={[styles.title, { color: palette.textPrimary }]}>Ambient Soundscapes</Text>
                <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
                  Layer soothing atmospheric textures with music
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityLabel="Close Ambient Soundscape Modal"
            >
              <X size={20} color={palette.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Active Status Banner */}
          <View style={[styles.statusBanner, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
            <View style={styles.statusLeft}>
              <View
                style={[
                  styles.statusPulse,
                  {
                    backgroundColor:
                      soundscape.isPlaying && soundscape.type !== "OFF"
                        ? palette.speaking
                        : palette.textTertiary,
                  },
                ]}
              />
              <Text style={[styles.statusText, { color: palette.textSecondary }]}>
                {soundscape.isPlaying && soundscape.type !== "OFF"
                  ? `Active Atmosphere: ${soundscape.type}`
                  : "Atmosphere Muted / Off"}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.togglePlayBtn, { backgroundColor: palette.surfaceHover }]}
              onPress={toggleSoundscapePlay}
              disabled={soundscape.type === "OFF"}
            >
              {soundscape.isPlaying && soundscape.type !== "OFF" ? (
                <Pause size={13} color={palette.textPrimary} />
              ) : (
                <Play size={13} color={palette.textPrimary} />
              )}
              <Text style={[styles.togglePlayText, { color: palette.textPrimary }]}>
                {soundscape.isPlaying && soundscape.type !== "OFF" ? "Pause" : "Resume"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
            {/* Soundscape Options */}
            <Text style={[styles.sectionHeader, { color: palette.textTertiary }]}>ATMOSPHERIC PRESETS</Text>
            {AMBIENT_SOUNDSCAPES.map((item) => {
              const isSelected = soundscape.type === item.id && soundscape.isPlaying;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.soundscapeCard,
                    { backgroundColor: palette.surface, borderColor: palette.borderSubtle },
                    isSelected && { borderColor: palette.accent, backgroundColor: palette.surfaceHover },
                  ]}
                  onPress={() => handleSelectType(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <Text style={styles.cardEmoji}>{item.emoji}</Text>
                      <View style={styles.cardTextContainer}>
                        <Text style={[styles.cardName, { color: palette.textPrimary }]}>
                          {item.name}
                        </Text>
                        <Text style={[styles.cardSubtitle, { color: palette.textSecondary }]}>{item.subtitle}</Text>
                      </View>
                    </View>
                    {isSelected && (
                      <View style={styles.activeCheckmark}>
                        <Check size={18} color={palette.textPrimary} />
                      </View>
                    )}
                  </View>

                  <Text style={[styles.cardDescription, { color: palette.textSecondary }]}>{item.description}</Text>
                  <View style={styles.frequencyTag}>
                    <Radio size={11} color={palette.textTertiary} />
                    <Text style={[styles.frequencyText, { color: palette.textTertiary }]}>{item.frequencyRange}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Mute Preset */}
            <TouchableOpacity
              style={[
                styles.soundscapeCard,
                { backgroundColor: palette.surface, borderColor: palette.borderSubtle, borderStyle: "dashed" },
                (soundscape.type === "OFF" || !soundscape.isPlaying) && { borderColor: palette.accent },
              ]}
              onPress={() => setSoundscapeType("OFF")}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Text style={styles.cardEmoji}>🔇</Text>
                  <View style={styles.cardTextContainer}>
                    <Text style={[styles.cardName, { color: palette.textPrimary }]}>Muted / None</Text>
                    <Text style={[styles.cardSubtitle, { color: palette.textSecondary }]}>Pure music playback only</Text>
                  </View>
                </View>
                {(soundscape.type === "OFF" || !soundscape.isPlaying) && (
                  <Check size={18} color={palette.textPrimary} />
                )}
              </View>
            </TouchableOpacity>

            {/* Ambient Volume Mixing Slider */}
            <View style={[styles.volumeContainer, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
              <View style={styles.volumeHeader}>
                <View style={styles.volumeTitleGroup}>
                  <Volume2 size={16} color={palette.textSecondary} />
                  <Text style={[styles.volumeTitle, { color: palette.textPrimary }]}>Ambient Mix Level</Text>
                </View>
                <Text style={[styles.volumePercent, { color: palette.textPrimary }]}>
                  {Math.round(soundscape.volume * 100)}%
                </Text>
              </View>
              <View style={styles.volumeStepsRow}>
                {volumeLevels.map((lvl) => {
                  const isCurrent = Math.abs(soundscape.volume - lvl) < 0.05;
                  return (
                    <TouchableOpacity
                      key={lvl}
                      style={[
                        styles.volumeStepBtn,
                        { backgroundColor: palette.card, borderColor: palette.borderSubtle },
                        isCurrent && { backgroundColor: palette.accent, borderColor: palette.accent },
                      ]}
                      onPress={() => setSoundscapeVolume(lvl)}
                    >
                      <Text
                        style={[
                          styles.volumeStepText,
                          { color: palette.textSecondary },
                          isCurrent && { color: palette.background, fontWeight: typography.weights.bold },
                        ]}
                      >
                        {Math.round(lvl * 100)}%
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

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
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  statusPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  togglePlayBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  togglePlayText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
  },
  scrollList: {
    marginTop: spacing.xs,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  soundscapeCard: {
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  cardEmoji: {
    fontSize: 22,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  cardSubtitle: {
    fontSize: 11,
  },
  activeCheckmark: {
    marginLeft: spacing.xs,
  },
  cardDescription: {
    fontSize: typography.sizes.xs,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  frequencyTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  frequencyText: {
    fontSize: 10,
  },
  volumeContainer: {
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
  },
  volumeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  volumeTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  volumeTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  volumePercent: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  volumeStepsRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  volumeStepBtn: {
    flex: 1,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    alignItems: "center",
    borderWidth: 1,
  },
  volumeStepText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
  },
});
