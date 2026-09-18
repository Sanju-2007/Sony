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
  TextInput,
} from "react-native";
import {
  Share2,
  X,
  Copy,
  Check,
  Users,
  Radio,
  Sparkles,
  UserPlus,
  Send,
  MessageSquare,
} from "lucide-react-native";
import { RoomDetails, TrackMetadata } from "@sony/types";
import { typography, spacing, radii } from "../../theme/tokens";
import { useThemeStore } from "../../store/themeStore";
import { useSocialStore, FriendItem } from "../../store/socialStore";
import { useChatStore } from "../../store/chatStore";

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
  const { palette } = useThemeStore();
  const { friends, addFriend, recordRoomInvite, isRoomInviteSent } = useSocialStore();
  const { startConversation, sendMessage } = useChatStore();

  const [copied, setCopied] = useState(false);
  const [justInvitedId, setJustInvitedId] = useState<string | null>(null);
  const [quickAddHandle, setQuickAddHandle] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentRoomId = room?.id || "room-live";
  const webOrigin = typeof window !== "undefined" && window.location ? window.location.origin : "https://sony-social-web.onrender.com";
  const roomUrl = `${webOrigin}/room/${currentRoomId}`;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(roomUrl);
    }
    setCopied(true);
    showToast("✓ Room link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInviteFriend = (friend: FriendItem) => {
    // 1. Record invite in social store
    recordRoomInvite(currentRoomId, friend.id);
    setJustInvitedId(friend.id);

    // 2. Dispatch invitation via direct chat thread
    startConversation({
      id: friend.id,
      name: friend.name,
      handle: friend.handle,
      avatar: friend.avatar,
    });
    sendMessage(
      friend.id,
      `Hey! Join my listening stage "${room?.name || 'Live Stage'}" 🎧 Listen synchronized in real time: ${roomUrl}`
    );

    showToast(`✓ Invitation sent to ${friend.name}!`);
    setTimeout(() => setJustInvitedId(null), 2500);
  };

  const handleQuickAddAndInvite = () => {
    if (!quickAddHandle.trim()) return;
    const clean = quickAddHandle.trim().replace(/^@/, "");
    const newFriend: FriendItem = {
      id: "friend-" + Date.now(),
      name: clean.charAt(0).toUpperCase() + clean.slice(1),
      handle: "@" + clean.toLowerCase(),
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&fit=crop&q=80",
      status: "ONLINE",
    };

    addFriend(newFriend);
    handleInviteFriend(newFriend);
    setQuickAddHandle("");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheetContainer, { backgroundColor: palette.background, borderColor: palette.border }]}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={[styles.handleBar, { backgroundColor: palette.border }]} />
            <View style={styles.titleRow}>
              <View style={styles.titleWithIcon}>
                <Users size={18} color={palette.accent} style={{ marginRight: 8 }} />
                <Text style={[styles.sheetTitle, { color: palette.textPrimary }]}>
                  Add Friends to Room
                </Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <X size={20} color={palette.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Feedback Toast */}
          {toastMessage && (
            <View style={[styles.toastBanner, { backgroundColor: palette.card, borderColor: palette.speaking }]}>
              <Sparkles size={14} color={palette.speaking} style={{ marginRight: 6 }} />
              <Text style={[styles.toastText, { color: palette.textPrimary }]}>{toastMessage}</Text>
            </View>
          )}

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Visual Room Summary Card */}
            <View style={[styles.inviteCard, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
              <Image
                source={{
                  uri:
                    track?.artworkUrl ||
                    room?.currentTrack?.artworkUrl ||
                    "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&fit=crop&q=80",
                }}
                style={styles.cardArtwork}
              />
              <View style={styles.cardDetails}>
                <View style={styles.badgeRow}>
                  <View style={[styles.liveBadge, { backgroundColor: palette.speaking }]}>
                    <Text style={styles.liveBadgeText}>LIVE STAGE</Text>
                  </View>
                  <Text style={[styles.listenerMeta, { color: palette.textTertiary }]}>
                    {room?.participantCount || 1} connected
                  </Text>
                </View>
                <Text style={[styles.cardRoomTitle, { color: palette.textPrimary }]} numberOfLines={1}>
                  {room?.name || "Listening Room"}
                </Text>
                <Text style={[styles.cardTrackMeta, { color: palette.textSecondary }]} numberOfLines={1}>
                  {track ? `${track.title} · ${track.artist}` : "Real-time Synchronized Audio"}
                </Text>
              </View>
            </View>

            {/* Quick Invite Friends Section */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>
                  YOUR FRIENDS ({friends.length})
                </Text>
                <Text style={[styles.subLabel, { color: palette.textTertiary }]}>
                  1-tap invite to stage
                </Text>
              </View>

              {friends.length === 0 ? (
                <View style={[styles.emptyFriendsBox, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
                  <Users size={22} color={palette.accent} style={{ marginBottom: 6 }} />
                  <Text style={[styles.emptyFriendsTitle, { color: palette.textPrimary }]}>
                    No friends connected yet
                  </Text>
                  <Text style={[styles.emptyFriendsSub, { color: palette.textTertiary }]}>
                    Add a friend by their username below to send them an instant invite to this room.
                  </Text>

                  {/* Inline Add & Invite Friend Input */}
                  <View style={[styles.inlineAddRow, { backgroundColor: palette.background, borderColor: palette.border }]}>
                    <TextInput
                      value={quickAddHandle}
                      onChangeText={setQuickAddHandle}
                      placeholder="Enter username (e.g. Maya)..."
                      placeholderTextColor={palette.textTertiary}
                      style={[styles.inlineInput, { color: palette.textPrimary }]}
                      onSubmitEditing={handleQuickAddAndInvite}
                    />
                    <TouchableOpacity
                      style={[styles.inlineAddBtn, { backgroundColor: palette.accent }]}
                      onPress={handleQuickAddAndInvite}
                    >
                      <UserPlus size={13} color={palette.accentInverted} style={{ marginRight: 4 }} />
                      <Text style={[styles.inlineAddBtnText, { color: palette.accentInverted }]}>Invite</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.friendsList}>
                  {friends.map((f) => {
                    const alreadySent = isRoomInviteSent(currentRoomId, f.id) || justInvitedId === f.id;
                    return (
                      <View
                        key={f.id}
                        style={[
                          styles.friendRow,
                          { backgroundColor: palette.surface, borderColor: palette.borderSubtle },
                        ]}
                      >
                        <Image source={{ uri: f.avatar }} style={styles.friendAvatar} />
                        <View style={styles.friendInfo}>
                          <Text style={[styles.friendName, { color: palette.textPrimary }]}>{f.name}</Text>
                          <Text style={[styles.friendHandle, { color: palette.textTertiary }]}>{f.handle}</Text>
                        </View>

                        <TouchableOpacity
                          activeOpacity={0.8}
                          disabled={alreadySent}
                          style={[
                            styles.inviteBtn,
                            {
                              backgroundColor: alreadySent ? palette.card : palette.accent,
                              borderColor: alreadySent ? palette.speaking : palette.accent,
                            },
                          ]}
                          onPress={() => handleInviteFriend(f)}
                        >
                          {alreadySent ? (
                            <>
                              <Check size={13} color={palette.speaking} strokeWidth={2.4} style={{ marginRight: 4 }} />
                              <Text style={[styles.inviteBtnText, { color: palette.speaking, fontWeight: "700" }]}>
                                Invite Sent ✓
                              </Text>
                            </>
                          ) : (
                            <>
                              <Send size={12} color={palette.accentInverted} style={{ marginRight: 4 }} />
                              <Text style={[styles.inviteBtnText, { color: palette.accentInverted, fontWeight: "700" }]}>
                                Add to Room
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    );
                  })}

                  {/* Add another friend quick inline */}
                  <View style={[styles.inlineAddRow, { backgroundColor: palette.surface, borderColor: palette.border, marginTop: spacing.sm }]}>
                    <TextInput
                      value={quickAddHandle}
                      onChangeText={setQuickAddHandle}
                      placeholder="Add another friend to invite (@handle)..."
                      placeholderTextColor={palette.textTertiary}
                      style={[styles.inlineInput, { color: palette.textPrimary }]}
                      onSubmitEditing={handleQuickAddAndInvite}
                    />
                    <TouchableOpacity
                      style={[styles.inlineAddBtn, { backgroundColor: palette.accent }]}
                      onPress={handleQuickAddAndInvite}
                    >
                      <UserPlus size={13} color={palette.accentInverted} style={{ marginRight: 4 }} />
                      <Text style={[styles.inlineAddBtnText, { color: palette.accentInverted }]}>Invite</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* Direct Room Link Share Section */}
            <View style={styles.linkSection}>
              <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>OR SHARE DIRECT ROOM LINK</Text>
              <View style={[styles.linkBox, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                <Text style={[styles.linkUrlText, { color: palette.textSecondary }]} numberOfLines={1}>
                  {roomUrl}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.copyBtn,
                    { backgroundColor: copied ? palette.speaking : palette.accent },
                  ]}
                  onPress={handleCopyLink}
                >
                  {copied ? (
                    <>
                      <Check size={13} color="#FFFFFF" strokeWidth={2.4} style={{ marginRight: 4 }} />
                      <Text style={styles.copyBtnText}>Copied</Text>
                    </>
                  ) : (
                    <>
                      <Copy size={13} color={palette.accentInverted} style={{ marginRight: 4 }} />
                      <Text style={[styles.copyBtnText, { color: palette.accentInverted }]}>Copy Link</Text>
                    </>
                  )}
                </TouchableOpacity>
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
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    height: 540,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: 30,
    borderTopWidth: 1,
  },
  sheetHeader: {
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.sm,
  },
  titleRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleWithIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  sheetTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  toastBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  toastText: {
    fontSize: typography.sizes.xs,
    fontWeight: "600",
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  inviteCard: {
    flexDirection: "row",
    padding: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    alignItems: "center",
  },
  cardArtwork: {
    width: 54,
    height: 54,
    borderRadius: radii.md,
    marginRight: spacing.sm,
  },
  cardDetails: {
    flex: 1,
    justifyContent: "center",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  liveBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.sm,
    marginRight: 6,
  },
  liveBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  listenerMeta: {
    fontSize: typography.sizes.xs,
  },
  cardRoomTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  cardTrackMeta: {
    fontSize: typography.sizes.xs,
    marginTop: 1,
  },
  sectionBlock: {
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  subLabel: {
    fontSize: 10,
  },
  emptyFriendsBox: {
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    alignItems: "center",
    textAlign: "center",
  },
  emptyFriendsTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  emptyFriendsSub: {
    fontSize: typography.sizes.xs,
    textAlign: "center",
    marginTop: 2,
    marginBottom: spacing.sm,
    maxWidth: 280,
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
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: spacing.sm,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  friendHandle: {
    fontSize: typography.sizes.xs,
  },
  inviteBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  inviteBtnText: {
    fontSize: typography.sizes.xs,
  },
  inlineAddRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radii.full,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    width: "100%",
  },
  inlineInput: {
    flex: 1,
    fontSize: typography.sizes.xs,
    paddingVertical: 4,
  },
  inlineAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  inlineAddBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
  },
  linkSection: {
    marginTop: spacing.xs,
  },
  linkBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: spacing.sm,
    paddingRight: 4,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
    marginTop: spacing.xs,
  },
  linkUrlText: {
    fontSize: typography.sizes.xs,
    flex: 1,
    marginRight: spacing.sm,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.full,
  },
  copyBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
});
