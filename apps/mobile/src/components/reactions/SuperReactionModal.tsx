import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from "react-native";
import { X, Sparkles, Flame, Heart, Disc } from "lucide-react-native";
import { colors, spacing, typography, radii } from "../../theme/tokens";
import { SuperReactionType } from "@sony/types";

interface SuperReactionModalProps {
  visible: boolean;
  onClose: () => void;
  onTrigger: (type: SuperReactionType) => void;
}

const SUPER_REACTION_OPTIONS: {
  type: SuperReactionType;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  bg: string;
}[] = [
  {
    type: "GOLDEN_VINYL",
    title: "Golden Vinyl Burst",
    subtitle: "Honor a legendary track moment",
    emoji: "📀",
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.1)",
  },
  {
    type: "DISCO_BLAST",
    title: "Disco Ball Explosion",
    subtitle: "Peak dance party glitter surge",
    emoji: "🪩",
    color: "#A855F7",
    bg: "rgba(168, 85, 247, 0.1)",
  },
  {
    type: "HEART_BURST",
    title: "Cosmic Heart Shower",
    subtitle: "Spread warmth & love in the room",
    emoji: "💖",
    color: "#EC4899",
    bg: "rgba(236, 72, 153, 0.1)",
  },
  {
    type: "FLAME_SURGE",
    title: "Hype Flame Surge",
    subtitle: "When the beat drops hard",
    emoji: "🔥",
    color: "#EF4444",
    bg: "rgba(239, 68, 68, 0.1)",
  },
];

export const SuperReactionModal: React.FC<SuperReactionModalProps> = ({
  visible,
  onClose,
  onTrigger,
}) => {
  const palette = colors.dark;

  const handleSelect = (type: SuperReactionType) => {
    onTrigger(type);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.cardContainer, { backgroundColor: palette.background, borderColor: palette.border }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleGroup}>
              <View style={[styles.iconBadge, { backgroundColor: "rgba(245, 158, 11, 0.15)" }]}>
                <Sparkles size={16} color="#F59E0B" />
              </View>
              <Text style={[styles.title, { color: palette.textPrimary }]}>Super Reactions</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={palette.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.subNote, { color: palette.textTertiary }]}>
            Send a fullscreen celebratory particle burst across all listeners' devices
          </Text>

          {/* Options Grid */}
          <View style={styles.optionsList}>
            {SUPER_REACTION_OPTIONS.map((item) => (
              <TouchableOpacity
                key={item.type}
                style={[
                  styles.optionRow,
                  { backgroundColor: item.bg, borderColor: "rgba(255, 255, 255, 0.08)" },
                ]}
                onPress={() => handleSelect(item.type)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionEmoji}>{item.emoji}</Text>
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, { color: item.color }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.optionSub, { color: palette.textSecondary }]}>
                    {item.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  cardContainer: {
    width: "100%",
    maxWidth: 380,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  closeBtn: {
    padding: 4,
  },
  subNote: {
    fontSize: 11,
    marginBottom: spacing.md,
  },
  optionsList: {
    gap: spacing.xs + 2,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  optionEmoji: {
    fontSize: 26,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  optionSub: {
    fontSize: 11,
    marginTop: 2,
  },
});
