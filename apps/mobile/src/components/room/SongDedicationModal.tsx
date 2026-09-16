import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Sparkles, X, Heart, Zap, Disc3, Check, Send } from "lucide-react-native";
import { colors, spacing, typography, radii } from "../../theme/tokens";
import { useRoomThemeStore } from "../../store/roomThemeStore";
import { socketService } from "../../services/socketService";
import { DedicationBadgeStyle, SongDedication, TrackMetadata } from "@sony/types";

interface SongDedicationModalProps {
  visible: boolean;
  onClose: () => void;
  currentTrack: TrackMetadata | null;
  roomId: string;
}

const RECIPIENT_OPTIONS = [
  { id: "all", name: "Everyone in the Room" },
  { id: "user-2", name: "Aisha" },
  { id: "user-3", name: "Rahul" },
  { id: "user-4", name: "Elena" },
];

const STYLE_OPTIONS: { id: DedicationBadgeStyle; label: string; icon: any; color: string }[] = [
  { id: "GOLDEN", label: "Golden Sunset", icon: Sparkles, color: "#F59E0B" },
  { id: "NEON", label: "Neon Pulse", icon: Zap, color: "#38BDF8" },
  { id: "HEART", label: "Cosmic Heart", icon: Heart, color: "#EC4899" },
  { id: "CLASSIC", label: "Classic Studio", icon: Disc3, color: "#FAFAFA" },
];

export const SongDedicationModal: React.FC<SongDedicationModalProps> = ({
  visible,
  onClose,
  currentTrack,
  roomId,
}) => {
  const palette = colors.dark;
  const { addDedication } = useRoomThemeStore();

  const [selectedRecipient, setSelectedRecipient] = useState(RECIPIENT_OPTIONS[0]);
  const [selectedStyle, setSelectedStyle] = useState<DedicationBadgeStyle>("GOLDEN");
  const [message, setMessage] = useState("");
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSendDedication = () => {
    if (!message.trim()) return;

    const newDedication: SongDedication = {
      id: "dedication-" + Date.now(),
      roomId,
      trackId: currentTrack?.id || "track-01",
      fromUserId: "user-1",
      fromUserName: "Sanju (You)",
      toUserId: selectedRecipient.id === "all" ? undefined : selectedRecipient.id,
      toUserName: selectedRecipient.name,
      message: message.trim(),
      badgeStyle: selectedStyle,
      createdAt: new Date().toISOString(),
    };

    addDedication(newDedication);
    socketService.sendDedication(newDedication);
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setMessage("");
      onClose();
    }, 1400);
  };

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
              <View style={[styles.iconBadge, { backgroundColor: "rgba(245, 158, 11, 0.15)" }]}>
                <Sparkles size={18} color="#F59E0B" />
              </View>
              <View>
                <Text style={[styles.title, { color: palette.textPrimary }]}>Dedicate Current Song</Text>
                <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
                  {currentTrack?.title || "Track"} • {currentTrack?.artist || "Artist"}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={palette.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Recipient Selection */}
            <Text style={[styles.sectionTitle, { color: palette.textTertiary }]}>DEDICATED TO</Text>
            <View style={styles.recipientRow}>
              {RECIPIENT_OPTIONS.map((rec) => {
                const isSelected = selectedRecipient.id === rec.id;
                return (
                  <TouchableOpacity
                    key={rec.id}
                    style={[
                      styles.recipientChip,
                      { backgroundColor: palette.surface, borderColor: palette.borderSubtle },
                      isSelected && { borderColor: palette.accent, backgroundColor: palette.surfaceHover },
                    ]}
                    onPress={() => setSelectedRecipient(rec)}
                  >
                    <Text
                      style={[
                        styles.recipientText,
                        { color: palette.textSecondary },
                        isSelected && { color: palette.textPrimary, fontWeight: typography.weights.semibold },
                      ]}
                    >
                      {rec.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Dedication Style Badges */}
            <Text style={[styles.sectionTitle, { color: palette.textTertiary, marginTop: spacing.md }]}>
              DEDICATION STYLE
            </Text>
            <View style={styles.stylesGrid}>
              {STYLE_OPTIONS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = selectedStyle === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.styleCard,
                      { backgroundColor: palette.surface, borderColor: palette.borderSubtle },
                      isSelected && { borderColor: item.color, backgroundColor: palette.surfaceHover },
                    ]}
                    onPress={() => setSelectedStyle(item.id)}
                  >
                    <IconComponent size={18} color={item.color} />
                    <Text style={[styles.styleLabel, { color: palette.textPrimary }]}>
                      {item.label}
                    </Text>
                    {isSelected && <Check size={14} color={item.color} style={styles.styleCheck} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Message Input */}
            <Text style={[styles.sectionTitle, { color: palette.textTertiary, marginTop: spacing.md }]}>
              DEDICATION NOTE
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
              <TextInput
                style={[styles.textInput, { color: palette.textPrimary }]}
                placeholder="Write a sweet note or memory for this track..."
                placeholderTextColor={palette.textTertiary}
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={120}
              />
              <Text style={[styles.charCount, { color: palette.textTertiary }]}>
                {message.length}/120
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: palette.accent },
                (!message.trim() && !sentSuccess) && { opacity: 0.5 },
                sentSuccess && { backgroundColor: "#10B981" },
              ]}
              onPress={handleSendDedication}
              disabled={!message.trim() || sentSuccess}
            >
              {sentSuccess ? (
                <>
                  <Check size={18} color="#FFFFFF" />
                  <Text style={[styles.submitBtnText, { color: "#FFFFFF" }]}>
                    Song Dedicated! 💖
                  </Text>
                </>
              ) : (
                <>
                  <Send size={16} color={palette.background} />
                  <Text style={[styles.submitBtnText, { color: palette.background }]}>
                    Pin Dedication to Room
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View style={{ height: 28 }} />
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
  scrollContent: {
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.1,
    marginBottom: spacing.xs,
  },
  recipientRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  recipientChip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  recipientText: {
    fontSize: 12,
  },
  stylesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  styleCard: {
    flexBasis: "48%",
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  styleLabel: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
    flex: 1,
  },
  styleCheck: {
    marginLeft: "auto",
  },
  inputContainer: {
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
    minHeight: 80,
    marginTop: spacing.xs,
  },
  textInput: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
    textAlignVertical: "top",
    minHeight: 50,
  },
  charCount: {
    fontSize: 10,
    textAlign: "right",
    marginTop: 4,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    marginTop: spacing.lg,
  },
  submitBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
});
