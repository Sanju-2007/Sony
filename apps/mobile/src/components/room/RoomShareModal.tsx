import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from "react-native";
import { Share2, X, Copy, Check, Users, Radio, Sparkles } from "lucide-react-native";
import { RoomDetails, TrackMetadata } from "@sony/types";
import { typography, colors, spacing, radii } from "../../theme/tokens";

interface RoomShareModalProps {
  visible: boolean;
  onClose: () => void;
  room?: RoomDetails | null;
  track?: TrackMetadata | null;
}

export function RoomShareModal({
  visible,
  onClose,
  room,
  track,
}: RoomShareModalProps) {
  const palette = colors.light;
  const [copied, setCopied] = useState(false);
  const [invitedIds, setInvitedIds] = useState<Record<string, boolean>>({});

  const roomUrl = "https://sony-listen.app/room/" + (room?.id || "room-late-night-1");

  const handleCopyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInviteFriend = (id: string) => {
    setInvitedIds((prev) => ({ ...prev, [id]: true }));
  };

  const mutuals = [
    { id: "u-aisha", name: "Aisha", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&q=80" },
    { id: "u-rahul", name: "Rahul", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop&q=80" },
    { id: "u-priya", name: "Priya", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&fit=crop&q=80" },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheetContainer, { backgroundColor: palette.background }]}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={[styles.handleBar, { backgroundColor: palette.border }]} />
            <View style={styles.titleRow}>
              <View style={styles.titleWithIcon}>
                <Share2 size={18} color={palette.textPrimary} style={{ marginRight: 6 }} />
                <Text style={[styles.sheetTitle, { color: palette.textPrimary }]}>Share Listening Room</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <X size={20} color={palette.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Visual Invite Card */}
            <View style={[styles.inviteCard, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
              <Image
                source={{ uri: track?.artworkUrl || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&fit=crop&q=80" }}
                style={styles.cardArtwork}
              />
              <View style={styles.cardDetails}>
                <View style={styles.badgeRow}>
                  <View style={[styles.liveBadge, { backgroundColor: palette.speaking }]}>
                    <Text style={styles.liveBadgeText}>LIVE NOW</Text>
                  </View>
                  <Text style={[styles.listenerMeta, { color: palette.textTertiary }]}>
                    {room?.participantCount || 1} listening
                  </Text>
                </View>
                <Text style={[styles.cardRoomTitle, { color: palette.textPrimary }] } numberOfLines={1}>
                  {room?.name || "Listening Room"}
                </Text>
                <Text style={[styles.cardTrackMeta, { color: palette.textSecondary }]} numberOfLines={1}>
                  {track ? `${track.title} · ${track.artist}` : "Real-time Synchronized Audio"}
                </Text>
              </View>
            </View>

            {/* Copy Link Row */}
            <View style={styles.linkSection}>
              <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>INVITE LINK</Text>
              <View style={[styles.linkBox, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                <Text style={[styles.linkUrlText, { color: palette.textSecondary }]} numberOfLines={1}>
                  {roomUrl}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.copyBtn,
                    { backgroundColor: copied ? palette.speaking : palette.textPrimary },
                  ]}
                  onPress={handleCopyLink}
                >
                  {copied ? (
                    <>
                      <Check size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={styles.copyBtnText}>Copied</Text>
                    </>
                  ) : (
                    <>
                      <Copy size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={styles.copyBtnText}>Copy</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Invite Mutual Friends */}
            <View style={styles.friendsSection}>
              <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>QUICK INVITE FRIENDS</Text>
              <View style={styles.friendsList}>
                {mutuals.map((f) => {
                  const isInvited = !!invitedIds[f.id];
                  return (
                    <View
                      key={f.id}
                      style={[
                        styles.friendRow,
                        { backgroundColor: palette.surface, borderColor: palette.borderSubtle },
                      ]}
                    >
                      <Image source={{ uri: f.avatar }} style={styles.friendAvatar} />
                      <Text style={[styles.friendName, { color: palette.textPrimary }]}>{f.name}</Text>
                      <TouchableOpacity
                        style={[
                          styles.inviteBtn,
                          {
                            backgroundColor: isInvited ? palette.speaking : palette.surface,
                            borderColor: isInvited ? palette.speaking : palette.border,
                          },
                        ]}
                        onPress={() => handleInviteFriend(f.id)}
                      >
                        <Text
                          style={[
                            styles.inviteBtnText,
                            { color: isInvited ? "#FFFFFF" : palette.textPrimary },
                          ]}
                        >
                          {isInvited ? "Invited ✓" : "Invite"}
                        </Text>
                      </TouchableOpacity>
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
    height: 480,
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
  inviteCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  cardArtwork: {
    width: 58,
    height: 58,
    borderRadius: radii.md,
  },
  cardDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
  },
  liveBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: radii.full,
  },
  liveBadgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: typography.weights.bold,
  },
  listenerMeta: {
    fontSize: 10,
  },
  cardRoomTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  cardTrackMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  linkSection: {
    gap: 6,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.wider,
  },
  linkBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingLeft: spacing.md,
    paddingRight: 4,
  },
  linkUrlText: {
    flex: 1,
    fontSize: typography.sizes.xs,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.sm,
  },
  copyBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: typography.weights.semibold,
  },
  friendsSection: {
    gap: 8,
  },
  friendsList: {
    gap: 8,
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  friendAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  friendName: {
    flex: 1,
    marginLeft: 10,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  inviteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  inviteBtnText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
  },
});
