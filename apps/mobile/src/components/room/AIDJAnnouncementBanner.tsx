import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { X, Sparkles, Volume2 } from "lucide-react-native";
import { AIDJAnnouncement } from "@sony/types";
import { AIDJ_PERSONAS } from "@sony/music-core";
import { colors, radii, spacing, typography } from "../../theme/tokens";

interface AIDJAnnouncementBannerProps {
  announcement: AIDJAnnouncement | null;
  onDismiss: () => void;
}

export const AIDJAnnouncementBanner: React.FC<AIDJAnnouncementBannerProps> = ({
  announcement,
  onDismiss,
}) => {
  if (!announcement) return null;

  const personaMeta = AIDJ_PERSONAS[announcement.persona] || AIDJ_PERSONAS.RADIO_HOST;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 9000);
    return () => clearTimeout(timer);
  }, [announcement]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.djBadge}>
            <Text style={styles.avatarEmoji}>{personaMeta.avatarEmoji}</Text>
            <View>
              <View style={styles.titleRow}>
                <Text style={styles.djName}>{personaMeta.name}</Text>
                <View style={styles.liveTag}>
                  <Text style={styles.liveTagText}>AI DJ</Text>
                </View>
              </View>
              <Text style={styles.personaTagline}>{personaMeta.tagline}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onDismiss} style={styles.closeBtn} activeOpacity={0.7}>
            <X size={16} color={colors.dark.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.commentaryText}>"{announcement.introText}"</Text>

        <View style={styles.footerRow}>
          <View style={styles.soundIndicator}>
            <Volume2 size={12} color={colors.dark.accent} style={{ marginRight: 4 }} />
            <Text style={styles.trackNote}>
              Transitioning to <Text style={styles.trackBold}>{announcement.trackTitle}</Text>
            </Text>
          </View>
          <View style={styles.waveGroup}>
            <View style={[styles.waveBar, { height: 12 }]} />
            <View style={[styles.waveBar, { height: 16 }]} />
            <View style={[styles.waveBar, { height: 8 }]} />
            <View style={[styles.waveBar, { height: 14 }]} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.sm,
    marginBottom: spacing.xs,
  },
  card: {
    backgroundColor: "rgba(30, 27, 75, 0.85)",
    borderColor: "rgba(139, 92, 246, 0.4)",
    borderWidth: 1.5,
    borderRadius: radii.md,
    padding: spacing.sm,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs - 2,
  },
  djBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  avatarEmoji: {
    fontSize: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: radii.full,
    padding: 3,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  djName: {
    color: "#FFFFFF",
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  liveTag: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.full,
  },
  liveTagText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: typography.weights.bold,
  },
  personaTagline: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 10,
  },
  closeBtn: {
    padding: 4,
  },
  commentaryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontStyle: "italic",
    lineHeight: 17,
    marginVertical: spacing.xs - 2,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  soundIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  trackNote: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 10,
  },
  trackBold: {
    color: "#F3F4F6",
    fontWeight: typography.weights.bold,
  },
  waveGroup: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
  },
  waveBar: {
    width: 2.5,
    backgroundColor: "#A78BFA",
    borderRadius: 1.5,
  },
});
