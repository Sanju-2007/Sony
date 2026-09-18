import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import {
  X,
  Mic2,
  Users,
  Sparkles,
  Music,
  Volume2,
  Send,
  LogOut,
  CheckCircle2,
} from "lucide-react-native";
import { useThemeStore } from "../../store/themeStore";
import { usePlaybackStore } from "../../store/playbackStore";
import { useRoomStore } from "../../store/roomStore";
import { useAuthStore } from "../../store/authStore";
import { spacing, radii } from "../../theme/tokens";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface SingTogetherModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenLyrics?: () => void;
}

export function SingTogetherModal({
  visible,
  onClose,
  onOpenLyrics,
}: SingTogetherModalProps) {
  const { palette, isDark } = useThemeStore();
  const { user } = useAuthStore();
  const { currentTrack, setVoiceActive, isVoiceActive, volume } = usePlaybackStore();
  const {
    currentRoom,
    members,
    isSingTogetherActive,
    singTogetherParticipants,
    broadcastSingTogetherInvite,
    joinSingTogether,
    leaveSingTogether,
  } = useRoomStore();

  const [inviteSent, setInviteSent] = useState(false);

  const currentUser = user || {
    id: "user-me",
    username: "me",
    displayName: "You",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
  };

  const isUserInChorus = singTogetherParticipants.some(
    (p) => p.userId === currentUser.id
  );

  const handleBroadcastInvite = () => {
    const trackName = currentTrack
      ? `${currentTrack.title} - ${currentTrack.artist}`
      : "Current Song";

    broadcastSingTogetherInvite(
      currentUser.displayName,
      trackName,
      currentRoom?.id || "room-1"
    );

    // Join local user to chorus
    joinSingTogether({
      userId: currentUser.id,
      displayName: currentUser.displayName,
      avatarUrl: currentUser.avatarUrl,
    });

    setVoiceActive(true);
    setInviteSent(true);

    setTimeout(() => {
      setInviteSent(false);
    }, 3000);
  };

  const handleJoin = () => {
    joinSingTogether({
      userId: currentUser.id,
      displayName: currentUser.displayName,
      avatarUrl: currentUser.avatarUrl,
    });
    setVoiceActive(true);
  };

  const handleLeave = () => {
    leaveSingTogether(currentUser.id);
    setVoiceActive(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: palette.surface, borderColor: palette.borderSubtle },
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.badgePill,
                  {
                    backgroundColor: isSingTogetherActive
                      ? "rgba(16, 185, 129, 0.15)"
                      : "rgba(245, 158, 11, 0.15)",
                  },
                ]}
              >
                <Mic2
                  size={12}
                  color={isSingTogetherActive ? "#10B981" : "#F59E0B"}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={[
                    styles.badgeText,
                    { color: isSingTogetherActive ? "#10B981" : "#F59E0B" },
                  ]}
                >
                  {isSingTogetherActive
                    ? "CHORUS ACTIVE · LIVE KARAOKE"
                    : "SING TOGETHER MODE"}
                </Text>
              </View>
              <Text style={[styles.modalTitle, { color: palette.textPrimary }]}>
                Sing Together
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.closeBtn,
                { backgroundColor: palette.background, borderColor: palette.border },
              ]}
              onPress={onClose}
            >
              <X size={18} color={palette.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* Song Card */}
            <View
              style={[
                styles.trackCard,
                { backgroundColor: palette.background, borderColor: palette.borderSubtle },
              ]}
            >
              <Image
                source={{
                  uri:
                    currentTrack?.artworkUrl ||
                    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300",
                }}
                style={styles.artwork}
              />
              <View style={styles.trackInfo}>
                <Text
                  style={[styles.trackTitle, { color: palette.textPrimary }]}
                  numberOfLines={1}
                >
                  {currentTrack?.title || "No Track Selected"}
                </Text>
                <Text
                  style={[styles.trackArtist, { color: palette.textSecondary }]}
                  numberOfLines={1}
                >
                  {currentTrack?.artist || "Select a song to sing"}
                </Text>
                <View style={styles.audioDuckingTag}>
                  <Volume2 size={12} color="#10B981" style={{ marginRight: 4 }} />
                  <Text style={styles.audioDuckingText}>
                    Audio ducking active (Music at {Math.round(volume * 100)}%)
                  </Text>
                </View>
              </View>
            </View>

            {/* Sing Together Explanation */}
            <View
              style={[
                styles.infoCard,
                { backgroundColor: palette.surfaceHover, borderColor: palette.borderSubtle },
              ]}
            >
              <Sparkles size={16} color={palette.accent} style={{ marginRight: 8, marginTop: 2 }} />
              <Text style={[styles.infoText, { color: palette.textSecondary }]}>
                When you start Sing Together, an invitation is sent to everyone in the room to join your live chorus with synchronized lyrics and vocal audio ducking!
              </Text>
            </View>

            {/* Active Chorus Members */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <Users size={14} color={palette.textSecondary} style={{ marginRight: 6 }} />
                <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
                  Chorus Members ({singTogetherParticipants.length})
                </Text>
              </View>

              {singTogetherParticipants.length === 0 ? (
                <Text
                  style={[styles.emptyChorusText, { color: palette.textTertiary }]}
                >
                  No one is singing yet. Send a request to invite the room!
                </Text>
              ) : (
                <View style={styles.participantsRow}>
                  {singTogetherParticipants.map((p) => (
                    <View
                      key={p.userId}
                      style={[
                        styles.participantPill,
                        {
                          backgroundColor: palette.background,
                          borderColor:
                            p.userId === currentUser.id
                              ? palette.accent
                              : palette.borderSubtle,
                        },
                      ]}
                    >
                      <Image
                        source={{
                          uri:
                            p.avatarUrl ||
                            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
                        }}
                        style={styles.avatar}
                      />
                      <Text
                        style={[
                          styles.participantName,
                          {
                            color:
                              p.userId === currentUser.id
                                ? palette.accent
                                : palette.textPrimary,
                          },
                        ]}
                      >
                        {p.displayName} {p.userId === currentUser.id ? "(You)" : ""}
                      </Text>
                      <View style={styles.liveMicIndicator}>
                        <View style={styles.greenDot} />
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Actions */}
            <View style={styles.actionsSection}>
              {/* Broadcast Invite Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.broadcastBtn,
                  {
                    backgroundColor: inviteSent
                      ? "#10B981"
                      : isSingTogetherActive
                      ? palette.accent
                      : "#8B5CF6",
                  },
                ]}
                onPress={handleBroadcastInvite}
              >
                {inviteSent ? (
                  <>
                    <CheckCircle2 size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.btnText}>Invitation Sent to Everyone!</Text>
                  </>
                ) : (
                  <>
                    <Send size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.btnText}>
                      {isSingTogetherActive
                        ? "Re-Invite Room to Sing"
                        : "Send Sing Together Request to Everyone"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Join / Leave Chorus Button */}
              {isSingTogetherActive && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.secondaryBtn,
                    {
                      backgroundColor: isUserInChorus
                        ? "rgba(239, 68, 68, 0.12)"
                        : "rgba(16, 185, 129, 0.12)",
                      borderColor: isUserInChorus ? "#EF4444" : "#10B981",
                    },
                  ]}
                  onPress={isUserInChorus ? handleLeave : handleJoin}
                >
                  {isUserInChorus ? (
                    <>
                      <LogOut size={15} color="#EF4444" style={{ marginRight: 6 }} />
                      <Text style={[styles.secondaryBtnText, { color: "#EF4444" }]}>
                        Leave Chorus
                      </Text>
                    </>
                  ) : (
                    <>
                      <Mic2 size={15} color="#10B981" style={{ marginRight: 6 }} />
                      <Text style={[styles.secondaryBtnText, { color: "#10B981" }]}>
                        Join Chorus Now
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {/* Open Synchronized Lyrics */}
              {onOpenLyrics && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.lyricsBtn,
                    {
                      backgroundColor: palette.background,
                      borderColor: palette.border,
                    },
                  ]}
                  onPress={() => {
                    onOpenLyrics();
                    onClose();
                  }}
                >
                  <Music size={14} color={palette.textPrimary} style={{ marginRight: 6 }} />
                  <Text
                    style={[styles.lyricsBtnText, { color: palette.textPrimary }]}
                  >
                    Open Synchronized Karaoke Lyrics
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    maxHeight: SCREEN_HEIGHT * 0.85,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  scrollBody: {
    paddingBottom: spacing.xl,
  },
  trackCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  artwork: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  trackInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  trackTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  trackArtist: {
    fontSize: 13,
    marginTop: 2,
  },
  audioDuckingTag: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  audioDuckingText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#10B981",
  },
  infoCard: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  sectionBlock: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  emptyChorusText: {
    fontSize: 12,
    fontStyle: "italic",
    paddingVertical: 8,
  },
  participantsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  participantPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  participantName: {
    fontSize: 12,
    fontWeight: "600",
    marginRight: 6,
  },
  liveMicIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  actionsSection: {
    gap: 10,
    marginTop: spacing.sm,
  },
  broadcastBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 14,
  },
  btnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  lyricsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
  },
  lyricsBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
