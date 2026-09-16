import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { X, Award, CheckCircle, Flame, Clock, Sparkles } from "lucide-react-native";
import { ListeningMilestone } from "@sony/types";
import { colors, radii, spacing, typography } from "../../theme/tokens";
import { useRoomStore } from "../../store/roomStore";
import { socketService } from "../../services/socketService";

interface MilestonesModalProps {
  visible: boolean;
  onClose: () => void;
  roomId: string;
}

export const MilestonesModal: React.FC<MilestonesModalProps> = ({
  visible,
  onClose,
  roomId,
}) => {
  const palette = colors.dark;
  const { milestones, unlockMilestone } = useRoomStore();

  const handleSimulateClaim = (milestone: ListeningMilestone) => {
    unlockMilestone(milestone.id);
    socketService.claimMilestone(roomId, {
      ...milestone,
      achieved: true,
      achievedAt: new Date().toISOString(),
    });
  };

  const achievedCount = milestones.filter((m) => m.achieved).length;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheetContainer, { backgroundColor: palette.background }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleGroup}>
              <View style={[styles.iconBadge, { backgroundColor: "rgba(245, 158, 11, 0.15)" }]}>
                <Award size={20} color="#F59E0B" />
              </View>
              <View>
                <Text style={[styles.title, { color: palette.textPrimary }]}>Room Milestones & Streaks</Text>
                <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
                  {achievedCount} of {milestones.length} group achievements unlocked
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={palette.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Group Vibe Streak Banner */}
          <View style={[styles.streakBanner, { backgroundColor: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.3)" }]}>
            <Flame size={20} color="#EF4444" style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.streakTitle}>Active Room Streak: 4 Tracks Synchronized</Text>
              <Text style={styles.streakSub}>Keep listening together to unlock the 5-Song Groove Streak!</Text>
            </View>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.milestonesList}>
              {milestones.map((item) => {
                const progress = Math.min(1, item.currentValue / item.targetValue);
                const percent = Math.round(progress * 100);

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.milestoneCard,
                      {
                        backgroundColor: item.achieved ? "rgba(16, 185, 129, 0.08)" : palette.surface,
                        borderColor: item.achieved ? "#10B981" : palette.borderSubtle,
                      },
                    ]}
                  >
                    <View style={styles.cardTopRow}>
                      <View style={styles.titleWithIcon}>
                        <Text style={styles.milestoneEmoji}>{item.icon}</Text>
                        <View>
                          <Text style={[styles.milestoneTitle, { color: palette.textPrimary }]}>
                            {item.title}
                          </Text>
                          <Text style={[styles.milestoneDesc, { color: palette.textSecondary }]}>
                            {item.description}
                          </Text>
                        </View>
                      </View>
                      {item.achieved ? (
                        <View style={styles.unlockedBadge}>
                          <CheckCircle size={14} color="#10B981" style={{ marginRight: 4 }} />
                          <Text style={styles.unlockedText}>Unlocked</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.claimTestBtn}
                          onPress={() => handleSimulateClaim(item)}
                        >
                          <Text style={styles.claimTestText}>Unlock</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                      <View style={styles.progressLabels}>
                        <Text style={[styles.progressVal, { color: palette.textTertiary }]}>
                          Progress: {item.currentValue} / {item.targetValue}
                        </Text>
                        <Text style={[styles.progressPercent, { color: item.achieved ? "#10B981" : palette.textSecondary }]}>
                          {item.achieved ? "100%" : `${percent}%`}
                        </Text>
                      </View>
                      <View style={[styles.progressTrack, { backgroundColor: palette.surfaceHover }]}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: item.achieved ? "100%" : `${percent}%`,
                              backgroundColor: item.achieved ? "#10B981" : "#F59E0B",
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    maxHeight: "82%",
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  streakBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  streakTitle: {
    color: "#EF4444",
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  streakSub: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 10,
    marginTop: 1,
  },
  scrollContent: {
    marginBottom: spacing.lg,
  },
  milestonesList: {
    gap: spacing.sm,
  },
  milestoneCard: {
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1.5,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  titleWithIcon: {
    flexDirection: "row",
    gap: spacing.xs,
    flex: 1,
    marginRight: spacing.xs,
  },
  milestoneEmoji: {
    fontSize: 24,
  },
  milestoneTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  milestoneDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  unlockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  unlockedText: {
    color: "#10B981",
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  claimTestBtn: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  claimTestText: {
    color: "#F59E0B",
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  progressContainer: {
    marginTop: spacing.sm,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  progressVal: {
    fontSize: 10,
  },
  progressPercent: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
});
