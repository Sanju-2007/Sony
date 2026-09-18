import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { Mic2, Music, X } from "lucide-react-native";
import { useThemeStore } from "../../store/themeStore";
import { spacing, radii } from "../../theme/tokens";

interface SingTogetherInviteModalProps {
  visible: boolean;
  initiatorName: string;
  trackTitle: string;
  onAccept: () => void;
  onDecline: () => void;
}

export function SingTogetherInviteModal({
  visible,
  initiatorName,
  trackTitle,
  onAccept,
  onDecline,
}: SingTogetherInviteModalProps) {
  const { palette } = useThemeStore();

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onDecline}>
      <View style={styles.modalOverlay}>
        <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onDecline}>
            <X size={16} color={palette.textTertiary} />
          </TouchableOpacity>

          <View style={styles.iconCircle}>
            <Mic2 size={24} color="#8B5CF6" />
          </View>

          <Text style={[styles.title, { color: palette.textPrimary }]}>
            Sing Together Invitation!
          </Text>

          <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
            <Text style={{ fontWeight: "700", color: palette.textPrimary }}>{initiatorName}</Text> invited everyone in the room to join the chorus and sing together!
          </Text>

          <View style={[styles.songPill, { backgroundColor: palette.background, borderColor: palette.borderSubtle }]}>
            <Music size={14} color="#8B5CF6" style={{ marginRight: 6 }} />
            <Text style={[styles.songTitle, { color: palette.textPrimary }]} numberOfLines={1}>
              {trackTitle}
            </Text>
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.declineBtn, { borderColor: palette.border }]}
              onPress={onDecline}
            >
              <Text style={[styles.declineText, { color: palette.textSecondary }]}>
                Maybe Later
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.acceptBtn, { backgroundColor: "#8B5CF6" }]}
              onPress={onAccept}
            >
              <Mic2 size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.acceptText}>Join Chorus</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginBottom: 14,
  },
  songPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.full,
    borderWidth: 1,
    marginBottom: 20,
    maxWidth: "90%",
  },
  songTitle: {
    fontSize: 12,
    fontWeight: "600",
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  declineBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  declineText: {
    fontSize: 13,
    fontWeight: "600",
  },
  acceptBtn: {
    flex: 1.4,
    height: 44,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  acceptText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
