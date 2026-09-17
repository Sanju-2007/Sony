import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { ShieldAlert, X, Check, Flag } from "lucide-react-native";
import { useThemeStore } from "../../store/themeStore";
import { useModerationStore, ReportReason } from "../../store/moderationStore";
import { typography, radii, spacing } from "../../theme/tokens";

interface ReportModalProps {
  visible: boolean;
  targetType: "USER" | "ROOM" | "MESSAGE";
  targetId: string;
  targetName?: string;
  onClose: () => void;
}

const REASONS: { label: string; value: ReportReason; desc: string }[] = [
  {
    label: "Harassment or Bullying",
    value: "HARASSMENT",
    desc: "Targeted insults, intimidation, or unwanted contact",
  },
  {
    label: "Spam or Commercial Scam",
    value: "SPAM_OR_SCAM",
    desc: "Unsolicited promotional content, phishing, or bot activity",
  },
  {
    label: "Inappropriate Content",
    value: "INAPPROPRIATE_MUSIC",
    desc: "Explicit audio, uncredited tracks, or copyright violations",
  },
  {
    label: "Hate Speech or Threats",
    value: "HATE_SPEECH",
    desc: "Violence, discrimination, or dangerous activities",
  },
  {
    label: "Other Issue",
    value: "OTHER",
    desc: "Other behavior violating community guidelines",
  },
];

export function ReportModal({
  visible,
  targetType,
  targetId,
  targetName,
  onClose,
}: ReportModalProps) {
  const { palette } = useThemeStore();
  const { submitReport, blockUser } = useModerationStore();

  const [selectedReason, setSelectedReason] =
    useState<ReportReason>("HARASSMENT");
  const [details, setDetails] = useState("");
  const [alsoBlock, setAlsoBlock] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    submitReport({
      targetType,
      targetId,
      targetName: targetName || targetId,
      reason: selectedReason,
      details: details.trim() || undefined,
    });

    if (alsoBlock && targetType === "USER") {
      blockUser(targetId);
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setDetails("");
      onClose();
    }, 1200);
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
              <ShieldAlert
                size={18}
                color="#EF4444"
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.title, { color: palette.textPrimary }]}>
                Report {targetType.toLowerCase()}
              </Text>
            </View>

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

          {submitted ? (
            <View style={styles.submittedContainer}>
              <View
                style={[
                  styles.checkCircle,
                  { backgroundColor: palette.speaking },
                ]}
              >
                <Check size={24} color="#FFFFFF" />
              </View>
              <Text
                style={[styles.submittedTitle, { color: palette.textPrimary }]}
              >
                Report Submitted
              </Text>
              <Text
                style={[
                  styles.submittedSubtitle,
                  { color: palette.textSecondary },
                ]}
              >
                Thank you for keeping our community safe. Our team and automated
                filters have logged this report.
              </Text>
            </View>
          ) : (
            <View style={styles.body}>
              <Text
                style={[styles.targetLabel, { color: palette.textSecondary }]}
              >
                Reporting:{" "}
                <Text
                  style={{
                    fontWeight: "700",
                    color: palette.textPrimary,
                  }}
                >
                  {targetName || targetId}
                </Text>
              </Text>

              <Text
                style={[styles.sectionTitle, { color: palette.textPrimary }]}
              >
                Select Reason
              </Text>

              {REASONS.map((r) => {
                const isSelected = selectedReason === r.value;
                return (
                  <TouchableOpacity
                    key={r.value}
                    style={[
                      styles.reasonOption,
                      {
                        backgroundColor: isSelected
                          ? palette.background
                          : palette.surface,
                        borderColor: isSelected
                          ? palette.accent
                          : palette.borderSubtle,
                      },
                    ]}
                    onPress={() => setSelectedReason(r.value)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.reasonLabel,
                          {
                            color: palette.textPrimary,
                            fontWeight: isSelected ? "700" : "500",
                          },
                        ]}
                      >
                        {r.label}
                      </Text>
                      <Text
                        style={[
                          styles.reasonDesc,
                          { color: palette.textTertiary },
                        ]}
                      >
                        {r.desc}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.radioOuter,
                        { borderColor: palette.border },
                        isSelected && {
                          borderColor: palette.accent,
                        },
                      ]}
                    >
                      {isSelected && (
                        <View
                          style={[
                            styles.radioInner,
                            { backgroundColor: palette.accent },
                          ]}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Optional Details */}
              <TextInput
                value={details}
                onChangeText={setDetails}
                placeholder="Additional details (optional)..."
                placeholderTextColor={palette.textTertiary}
                multiline
                numberOfLines={3}
                style={[
                  styles.detailsInput,
                  {
                    backgroundColor: palette.background,
                    borderColor: palette.border,
                    color: palette.textPrimary,
                  },
                ]}
              />

              {/* Block user checkbox if reporting user */}
              {targetType === "USER" && (
                <TouchableOpacity
                  style={styles.blockRow}
                  onPress={() => setAlsoBlock(!alsoBlock)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.checkbox,
                      { borderColor: palette.border },
                      alsoBlock && {
                        backgroundColor: palette.accent,
                        borderColor: palette.accent,
                      },
                    ]}
                  >
                    {alsoBlock && (
                      <Check
                        size={12}
                        color={palette.accentInverted}
                      />
                    )}
                  </View>
                  <Text
                    style={[styles.blockText, { color: palette.textPrimary }]}
                  >
                    Also block this user from your room and chats
                  </Text>
                </TouchableOpacity>
              )}

              {/* Submit CTA */}
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  { backgroundColor: "#EF4444" },
                ]}
                onPress={handleSubmit}
              >
                <Flag
                  size={15}
                  color="#FFFFFF"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.submitBtnText}>Submit Report</Text>
              </TouchableOpacity>
            </View>
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
    maxWidth: 480,
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: "hidden",
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
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    padding: spacing.lg,
  },
  targetLabel: {
    fontSize: typography.sizes.xs,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: spacing.xs,
  },
  reasonOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: 6,
  },
  reasonLabel: {
    fontSize: typography.sizes.xs,
    marginBottom: 2,
  },
  reasonDesc: {
    fontSize: 10,
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  detailsInput: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.sm,
    fontSize: typography.sizes.xs,
    height: 60,
    marginTop: spacing.xs,
    textAlignVertical: "top",
  },
  blockRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  blockText: {
    fontSize: typography.sizes.xs,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: radii.full,
    marginTop: spacing.lg,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  submittedContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 44,
    paddingHorizontal: spacing.xl,
  },
  checkCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  submittedTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    marginBottom: 6,
  },
  submittedSubtitle: {
    fontSize: typography.sizes.xs,
    textAlign: "center",
    lineHeight: 18,
  },
});
