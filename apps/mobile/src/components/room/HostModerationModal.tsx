import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  Dimensions,
} from "react-native";
import {
  X,
  Shield,
  Mic,
  MicOff,
  UserCheck,
  Crown,
  UserX,
  Lock,
  Radio,
} from "lucide-react-native";
import { RoomMemberInfo, ModerationActionType } from "@sony/types";
import { typography, colors, spacing, radii } from "../../theme/tokens";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface HostModerationModalProps {
  visible: boolean;
  onClose: () => void;
  members: RoomMemberInfo[];
  currentUserId?: string;
  onModerationAction: (targetUserId: string, action: ModerationActionType) => void;
}

export function HostModerationModal({
  visible,
  onClose,
  members,
  currentUserId,
  onModerationAction,
}: HostModerationModalProps) {
  const palette = colors.light;
  const [isRoomLocked, setIsRoomLocked] = useState(false);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheetContainer, { backgroundColor: palette.background }]}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={[styles.handleBar, { backgroundColor: palette.border }]} />
            <View style={styles.titleRow}>
              <View style={styles.titleWithIcon}>
                <Shield size={18} color={palette.textPrimary} style={{ marginRight: 6 }} />
                <Text style={[styles.sheetTitle, { color: palette.textPrimary }]}>Host Moderation & Controls</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <X size={20} color={palette.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Room Security Setting */}
            <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
              <View style={styles.lockRow}>
                <View style={styles.lockInfo}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Lock size={16} color={palette.textPrimary} style={{ marginRight: 6 }} />
                    <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>Lock Room</Text>
                  </View>
                  <Text style={[styles.cardDesc, { color: palette.textTertiary }]}>
                    Prevent new listeners from discovering or entering this room
                  </Text>
                </View>
                <Switch
                  value={isRoomLocked}
                  onValueChange={setIsRoomLocked}
                  trackColor={{ true: palette.speaking, false: palette.border }}
                />
              </View>
            </View>

            {/* Stage Speakers & Listeners Management */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: palette.textTertiary }]}>ROOM PARTICIPANTS ({members.length})</Text>
              <View style={styles.memberList}>
                {members.map((m) => {
                  const isMe = m.userId === currentUserId;
                  const isHost = m.role === "HOST";

                  return (
                    <View
                      key={m.userId}
                      style={[
                        styles.memberCard,
                        { backgroundColor: palette.surface, borderColor: palette.borderSubtle },
                      ]}
                    >
                      <View style={styles.memberInfo}>
                        <View style={styles.memberNameRow}>
                          <Text style={[styles.memberName, { color: palette.textPrimary }]}>
                            {m.user.displayName}
                          </Text>
                          {isHost && (
                            <View style={[styles.roleBadge, { backgroundColor: palette.textPrimary }]}>
                              <Crown size={10} color="#FFFFFF" style={{ marginRight: 3 }} />
                              <Text style={styles.roleBadgeText}>Host</Text>
                            </View>
                          )}
                          {!isHost && m.role === "MODERATOR" && (
                            <View style={[styles.roleBadge, { backgroundColor: palette.speaking }]}>
                              <Radio size={10} color="#FFFFFF" style={{ marginRight: 3 }} />
                              <Text style={styles.roleBadgeText}>Speaker</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.memberHandle, { color: palette.textTertiary }]}>
                          @{m.user.username} {isMe ? "(You)" : ""}
                        </Text>
                      </View>

                      {!isHost && (
                        <View style={styles.actionsRow}>
                          {/* Mute toggle */}
                          <TouchableOpacity
                            style={[
                              styles.actionIconBtn,
                              {
                                backgroundColor: m.isMuted ? palette.background : palette.surface,
                                borderColor: palette.border,
                              },
                            ]}
                            onPress={() =>
                              onModerationAction(m.userId, m.isMuted ? "UNMUTE" : "MUTE")
                            }
                          >
                            {m.isMuted ? (
                              <MicOff size={14} color={palette.duckingIndicator} />
                            ) : (
                              <Mic size={14} color={palette.speaking} />
                            )}
                          </TouchableOpacity>

                          {/* Promote to speaker / demote */}
                          <TouchableOpacity
                            style={[styles.actionIconBtn, { borderColor: palette.border }]}
                            onPress={() =>
                              onModerationAction(
                                m.userId,
                                m.role === "MODERATOR"
                                  ? "DEMOTE_TO_LISTENER"
                                  : "PROMOTE_TO_SPEAKER"
                              )
                            }
                          >
                            <UserCheck size={14} color={palette.textPrimary} />
                          </TouchableOpacity>

                          {/* Transfer Host */}
                          <TouchableOpacity
                            style={[styles.actionIconBtn, { borderColor: palette.border }]}
                            onPress={() => onModerationAction(m.userId, "TRANSFER_HOST")}
                          >
                            <Crown size={14} color={palette.textSecondary} />
                          </TouchableOpacity>

                          {/* Kick */}
                          <TouchableOpacity
                            style={[styles.actionIconBtn, { borderColor: palette.border }]}
                            onPress={() => onModerationAction(m.userId, "KICK")}
                          >
                            <UserX size={14} color={palette.duckingIndicator} />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          </ScrollView>
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
    height: SCREEN_HEIGHT * 0.75,
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
  scrollContent: {
    paddingVertical: spacing.sm,
    gap: 16,
  },
  card: {
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  lockRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lockInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  cardTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  cardDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.wider,
  },
  memberList: {
    gap: 8,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  memberName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  roleBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: typography.weights.bold,
  },
  memberHandle: {
    fontSize: 10,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
});
