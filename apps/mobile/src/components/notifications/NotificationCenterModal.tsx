import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  Bell,
  X,
  CheckCheck,
  Radio,
  UserPlus,
  Heart,
  Award,
  Sparkles,
  ArrowRight,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useThemeStore } from "../../store/themeStore";
import {
  useNotificationStore,
  AppNotification,
} from "../../store/notificationStore";
import { useSocialStore } from "../../store/socialStore";
import { typography, radii, spacing } from "../../theme/tokens";

interface NotificationCenterModalProps {
  visible: boolean;
  onClose: () => void;
}

export function NotificationCenterModal({
  visible,
  onClose,
}: NotificationCenterModalProps) {
  const router = useRouter();
  const { palette } = useThemeStore();
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotificationStore();
  const { acceptRequest } = useSocialStore();

  const handleAction = (item: AppNotification) => {
    markAsRead(item.id);

    if (item.type === "ROOM_INVITE" && item.actionUrl) {
      onClose();
      router.push(item.actionUrl as any);
    } else if (item.type === "FRIEND_REQUEST" && item.data?.requestId) {
      acceptRequest(item.data.requestId);
    } else if (item.actionUrl) {
      onClose();
      router.push(item.actionUrl as any);
    }
  };

  const renderIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "ROOM_INVITE":
        return <Radio size={16} color={palette.speaking} />;
      case "FRIEND_REQUEST":
        return <UserPlus size={16} color={palette.accent} />;
      case "SONG_DEDICATION":
        return <Heart size={16} color="#EC4899" />;
      case "MILESTONE":
        return <Award size={16} color="#F59E0B" />;
      default:
        return <Bell size={16} color={palette.textSecondary} />;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              { borderBottomColor: palette.borderSubtle },
            ]}
          >
            <View style={styles.headerLeft}>
              <Bell size={18} color={palette.textPrimary} style={{ marginRight: 8 }} />
              <Text style={[styles.title, { color: palette.textPrimary }]}>
                Activity
              </Text>
            </View>

            <View style={styles.headerActions}>
              {notifications.length > 0 && (
                <TouchableOpacity
                  onPress={markAllAsRead}
                  style={styles.markAllBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <CheckCheck
                    size={14}
                    color={palette.textSecondary}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[styles.markAllText, { color: palette.textSecondary }]}
                  >
                    Read all
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={onClose}
                style={[
                  styles.closeBtn,
                  { backgroundColor: palette.background },
                ]}
              >
                <X size={16} color={palette.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Body */}
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <View
                style={[
                  styles.emptyIconCircle,
                  { backgroundColor: palette.background, borderColor: palette.border },
                ]}
              >
                <Sparkles size={24} color={palette.textTertiary} />
              </View>
              <Text style={[styles.emptyTitle, { color: palette.textPrimary }]}>
                No notifications yet
              </Text>
              <Text
                style={[styles.emptySubtitle, { color: palette.textSecondary }]}
              >
                You're all caught up! Room invites, song dedications, and friend
                updates will appear here.
              </Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              {notifications.map((n) => (
                <View
                  key={n.id}
                  style={[
                    styles.notifCard,
                    {
                      backgroundColor: n.read
                        ? palette.surface
                        : palette.background,
                      borderColor: palette.borderSubtle,
                    },
                  ]}
                >
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.typeRow}>
                      {renderIcon(n.type)}
                      <Text
                        style={[
                          styles.notifTitle,
                          { color: palette.textPrimary },
                          !n.read && { fontWeight: "700" },
                        ]}
                      >
                        {n.title}
                      </Text>
                    </View>

                    <View style={styles.metaRow}>
                      {!n.read && (
                        <View
                          style={[
                            styles.unreadDot,
                            { backgroundColor: palette.accent },
                          ]}
                        />
                      )}
                      <Text
                        style={[
                          styles.timeText,
                          { color: palette.textTertiary },
                        ]}
                      >
                        {n.timestamp}
                      </Text>
                      <TouchableOpacity
                        onPress={() => deleteNotification(n.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={{ marginLeft: 6 }}
                      >
                        <X size={13} color={palette.textTertiary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.notifMessage,
                      { color: palette.textSecondary },
                    ]}
                  >
                    {n.message}
                  </Text>

                  {n.actionLabel && (
                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        { backgroundColor: palette.accent },
                      ]}
                      onPress={() => handleAction(n)}
                    >
                      <Text
                        style={[
                          styles.actionBtnText,
                          { color: palette.accentInverted },
                        ]}
                      >
                        {n.actionLabel}
                      </Text>
                      <ArrowRight
                        size={12}
                        color={palette.accentInverted}
                        style={{ marginLeft: 4 }}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              <TouchableOpacity
                onPress={clearAll}
                style={styles.clearAllBtn}
              >
                <Text style={[styles.clearAllText, { color: palette.textTertiary }]}>
                  Clear all notifications
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  modalCard: {
    width: "100%",
    maxWidth: 460,
    maxHeight: "80%",
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  markAllText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: spacing.xl,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: typography.sizes.xs,
    textAlign: "center",
    lineHeight: 18,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  notifCard: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  notifTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  timeText: {
    fontSize: 10,
  },
  notifMessage: {
    fontSize: typography.sizes.xs,
    lineHeight: 18,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    marginTop: 10,
  },
  actionBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  clearAllBtn: {
    alignSelf: "center",
    paddingVertical: spacing.md,
  },
  clearAllText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
});
