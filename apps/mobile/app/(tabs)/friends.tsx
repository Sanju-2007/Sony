import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  UserPlus,
  Users,
  Music,
  Radio,
  Headphones,
  Check,
  Search,
  X,
  Sparkles,
  MessageSquare,
  Clock,
  Send,
} from "lucide-react-native";
import { typography, spacing, radii } from "../../src/theme/tokens";
import { usePlaybackStore } from "../../src/store/playbackStore";
import { CATALOG_TRACKS } from "../../src/components/music/MusicSearchModal";
import { useThemeStore } from "../../src/store/themeStore";
import { ThemeToggleButton } from "../../src/components/theme/ThemeToggleButton";

import { useSocialStore, FriendItem } from "../../src/store/socialStore";
import { useChatStore } from "../../src/store/chatStore";

export default function FriendsScreen() {
  const router = useRouter();
  const { palette, isDark } = useThemeStore();
  const { playTrackImmediate } = usePlaybackStore();
  const { friends, pendingRequests, sentRequests, acceptRequest, declineRequest, addFriend, sendRequest } = useSocialStore();
  const { startConversation } = useChatStore();

  const [activeTab, setActiveTab] = useState<"activity" | "requests">("activity");
  const [requestsSubTab, setRequestsSubTab] = useState<"incoming" | "sent">("incoming");
  const [syncedFriendId, setSyncedFriendId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchHandle, setSearchHandle] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const sentList = Object.values(sentRequests);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleListenAlong = (friend: FriendItem) => {
    if (!friend.currentTrack) return;
    const matchingTrack = CATALOG_TRACKS.find(
      (t) =>
        t.title.toLowerCase() === friend.currentTrack?.toLowerCase() ||
        t.artist.toLowerCase() === friend.artist?.toLowerCase()
    ) || CATALOG_TRACKS[0];

    playTrackImmediate(matchingTrack);
    setSyncedFriendId(friend.id);
    setTimeout(() => setSyncedFriendId(null), 2500);
  };

  const handleAddFriend = () => {
    if (!searchHandle.trim()) return;
    const raw = searchHandle.trim().replace(/^@/, "");
    const newFriend: FriendItem = {
      id: "friend-" + Date.now(),
      name: raw.charAt(0).toUpperCase() + raw.slice(1),
      handle: "@" + raw.toLowerCase(),
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&fit=crop&q=80",
      status: "ONLINE",
    };
    sendRequest(newFriend);
    addFriend(newFriend);
    showToast(`✓ Friend request sent to @${raw.toLowerCase()}!`);
    setSearchHandle("");
    setShowAddModal(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: palette.textTertiary }]}>· connections</Text>
            <Text style={[styles.mainTitle, { color: palette.textPrimary }]}>Friends</Text>
          </View>
          <View style={styles.headerActions}>
            <ThemeToggleButton />
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: palette.surface, borderColor: palette.border }]}
              onPress={() => setShowAddModal(true)}
            >
              <UserPlus size={18} color={palette.textPrimary} />
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

        {/* Tab Toggle (Activity vs Requests) */}
        <View style={[styles.tabToggleRow, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === "activity" && { backgroundColor: palette.accent },
            ]}
            onPress={() => setActiveTab("activity")}
          >
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === "activity" ? palette.accentInverted : palette.textSecondary },
              ]}
            >
              Listening Activity ({friends.filter((f) => f.status !== "OFFLINE").length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === "requests" && { backgroundColor: palette.accent },
            ]}
            onPress={() => setActiveTab("requests")}
          >
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === "requests" ? palette.accentInverted : palette.textSecondary },
              ]}
            >
              Requests ({pendingRequests.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* ACTIVE TAB: ACTIVITY */}
        {activeTab === "activity" && (
          friends.length === 0 ? (
            <View style={[styles.emptyFriendsCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              <Users size={28} color={palette.accent} style={{ marginBottom: 10 }} />
              <Text style={[styles.emptyFriendsTitle, { color: palette.textPrimary }]}>No friends added yet</Text>
              <Text style={[styles.emptyFriendsSubtitle, { color: palette.textSecondary }]}>
                Connect with friends to see what they are listening to in real time, sync playback, and jump into stages together.
              </Text>
              <TouchableOpacity
                style={[styles.emptyFriendsBtn, { backgroundColor: palette.accent }]}
                onPress={() => setShowAddModal(true)}
              >
                <UserPlus size={15} color={palette.accentInverted} style={{ marginRight: 6 }} />
                <Text style={[styles.emptyFriendsBtnText, { color: palette.accentInverted }]}>Add Friends</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.list}>
              {friends.map((f) => {
                const isSynced = syncedFriendId === f.id;
                return (
                  <View
                    key={f.id}
                    style={[
                      styles.friendCard,
                      { backgroundColor: palette.surface, borderColor: palette.borderSubtle },
                    ]}
                  >
                    <View style={styles.avatarWrapper}>
                      <Image source={{ uri: f.avatar }} style={styles.avatar} />
                      <View
                        style={[
                          styles.statusDot,
                          {
                            backgroundColor:
                              f.status === "IN_ROOM"
                                ? palette.speaking
                                : f.status === "ONLINE"
                                ? palette.textPrimary
                                : palette.textTertiary,
                          },
                        ]}
                      />
                    </View>

                    <View style={styles.info}>
                      <View style={styles.nameRow}>
                        <Text style={[styles.name, { color: palette.textPrimary }]}>{f.name}</Text>
                        <Text style={[styles.handle, { color: palette.textTertiary }]}>{f.handle}</Text>
                      </View>

                      {f.currentTrack ? (
                        <View style={styles.listeningRow}>
                          <Music size={11} color={palette.speaking} style={{ marginRight: 4 }} />
                          <Text style={[styles.trackText, { color: palette.textSecondary }]} numberOfLines={1}>
                            {f.currentTrack} · {f.artist || "Playing"}
                          </Text>
                        </View>
                      ) : (
                        <Text style={[styles.offlineText, { color: palette.textTertiary }]}>Online · Ready to listen</Text>
                      )}

                      {f.roomName && (
                        <View style={styles.roomTagRow}>
                          <Radio size={10} color={palette.duckingIndicator} style={{ marginRight: 4 }} />
                          <Text style={[styles.roomTagText, { color: palette.duckingIndicator }]}>
                            in {f.roomName}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Actions: Join Room or Listen Along */}
                    <View style={styles.cardActions}>
                      {f.status === "IN_ROOM" && f.roomId && (
                        <TouchableOpacity
                          style={[styles.joinBtn, { backgroundColor: palette.accent }]}
                          onPress={() => router.push("/room/" + f.roomId)}
                        >
                          <Text style={[styles.joinBtnText, { color: palette.accentInverted }]}>Join Room</Text>
                        </TouchableOpacity>
                      )}

                      {f.currentTrack && f.status !== "IN_ROOM" && (
                        <TouchableOpacity
                          style={[
                            styles.listenAlongBtn,
                            {
                              backgroundColor: isSynced ? palette.speaking : palette.surface,
                              borderColor: isSynced ? palette.speaking : palette.border,
                            },
                          ]}
                          onPress={() => handleListenAlong(f)}
                        >
                          {isSynced ? (
                            <>
                              <Check size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                              <Text style={styles.syncedText}>Synced</Text>
                            </>
                          ) : (
                            <>
                              <Headphones size={12} color={palette.textPrimary} style={{ marginRight: 4 }} />
                              <Text style={[styles.listenAlongText, { color: palette.textPrimary }]}>Listen Along</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      )}
                      {/* Direct Message Chat Button */}
                      <TouchableOpacity
                        style={[
                          styles.chatBtn,
                          {
                            backgroundColor: palette.card,
                            borderColor: palette.border,
                          },
                        ]}
                        onPress={() => {
                          startConversation({
                            id: f.id,
                            name: f.name,
                            handle: f.handle,
                            avatar: f.avatar,
                          });
                          router.push("/(tabs)/messages");
                        }}
                      >
                        <MessageSquare size={12} color={palette.textPrimary} style={{ marginRight: 4 }} />
                        <Text style={[styles.chatBtnText, { color: palette.textPrimary }]}>Chat</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )
        )}

        {/* ACTIVE TAB: REQUESTS */}
        {activeTab === "requests" && (
          <View>
            {/* Sub Toggle: Incoming vs Sent */}
            <View style={[styles.subToggleRow, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
              <TouchableOpacity
                style={[
                  styles.subToggleBtn,
                  requestsSubTab === "incoming" && { backgroundColor: palette.card, borderColor: palette.border },
                ]}
                onPress={() => setRequestsSubTab("incoming")}
              >
                <Text
                  style={[
                    styles.subToggleBtnText,
                    {
                      color: requestsSubTab === "incoming" ? palette.textPrimary : palette.textTertiary,
                      fontWeight: requestsSubTab === "incoming" ? "700" : "500",
                    },
                  ]}
                >
                  Incoming ({pendingRequests.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.subToggleBtn,
                  requestsSubTab === "sent" && { backgroundColor: palette.card, borderColor: palette.border },
                ]}
                onPress={() => setRequestsSubTab("sent")}
              >
                <Text
                  style={[
                    styles.subToggleBtnText,
                    {
                      color: requestsSubTab === "sent" ? palette.textPrimary : palette.textTertiary,
                      fontWeight: requestsSubTab === "sent" ? "700" : "500",
                    },
                  ]}
                >
                  Sent Requests ({sentList.length})
                </Text>
              </TouchableOpacity>
            </View>

            {requestsSubTab === "incoming" ? (
              pendingRequests.length === 0 ? (
                <View style={[styles.emptyFriendsCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                  <Check size={28} color={palette.accent} style={{ marginBottom: 10 }} />
                  <Text style={[styles.emptyFriendsTitle, { color: palette.textPrimary }]}>No incoming requests</Text>
                  <Text style={[styles.emptyFriendsSubtitle, { color: palette.textSecondary }]}>
                    When other listeners send you an invite to sync or connect, invitations will appear here.
                  </Text>
                </View>
              ) : (
                <View style={styles.list}>
                  {pendingRequests.map((r) => (
                    <View
                      key={r.id}
                      style={[
                        styles.requestCard,
                        { backgroundColor: palette.surface, borderColor: palette.borderSubtle },
                      ]}
                    >
                      <Image source={{ uri: r.avatar }} style={styles.avatar} />
                      <View style={styles.info}>
                        <Text style={[styles.name, { color: palette.textPrimary }]}>{r.name}</Text>
                        <Text style={[styles.handle, { color: palette.textTertiary }]}>
                          {r.handle} · {r.mutualCount} mutual friends
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.acceptBtn, { backgroundColor: palette.accent }]}
                        onPress={() => acceptRequest(r)}
                      >
                        <Text style={[styles.acceptBtnText, { color: palette.accentInverted }]}>Accept</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )
            ) : (
              sentList.length === 0 ? (
                <View style={[styles.emptyFriendsCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                  <Clock size={28} color={palette.accent} style={{ marginBottom: 10 }} />
                  <Text style={[styles.emptyFriendsTitle, { color: palette.textPrimary }]}>No sent requests</Text>
                  <Text style={[styles.emptyFriendsSubtitle, { color: palette.textSecondary }]}>
                    Friend requests you send to other users will be listed here with live confirmation status.
                  </Text>
                </View>
              ) : (
                <View style={styles.list}>
                  {sentList.map((req) => (
                    <View
                      key={req.id}
                      style={[
                        styles.requestCard,
                        { backgroundColor: palette.surface, borderColor: palette.borderSubtle },
                      ]}
                    >
                      <Image source={{ uri: req.avatar }} style={styles.avatar} />
                      <View style={styles.info}>
                        <Text style={[styles.name, { color: palette.textPrimary }]}>{req.name}</Text>
                        <Text style={[styles.handle, { color: palette.textTertiary }]}>
                          {req.handle} · Sent {req.sentAt}
                        </Text>
                      </View>

                      <View style={styles.sentActionsRow}>
                        <View style={[styles.sentStatusBadge, { backgroundColor: palette.card, borderColor: palette.speaking }]}>
                          <Check size={11} color={palette.speaking} style={{ marginRight: 4 }} />
                          <Text style={[styles.sentStatusText, { color: palette.speaking }]}>Request Sent</Text>
                        </View>
                        <TouchableOpacity
                          style={[styles.chatBtn, { backgroundColor: palette.surface, borderColor: palette.border, marginLeft: 6 }]}
                          onPress={() => {
                            startConversation({
                              id: req.id,
                              name: req.name,
                              handle: req.handle,
                              avatar: req.avatar,
                            });
                            router.push("/(tabs)/messages");
                          }}
                        >
                          <MessageSquare size={12} color={palette.textPrimary} style={{ marginRight: 3 }} />
                          <Text style={[styles.chatBtnText, { color: palette.textPrimary }]}>Chat</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )
            )}
          </View>
        )}
      </ScrollView>

      {/* ADD FRIEND MODAL */}
      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modalContent, { backgroundColor: palette.background }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Sparkles size={18} color={palette.textPrimary} style={{ marginRight: 6 }} />
                <Text style={[styles.modalTitle, { color: palette.textPrimary }]}>Connect With Friends</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={20} color={palette.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: palette.textSecondary, marginBottom: 12 }}>
              Add any friend by username to start listening together with synced audio.
            </Text>

            <View style={[styles.searchBox, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              <Search size={16} color={palette.textTertiary} style={{ marginRight: 8 }} />
              <TextInput
                value={searchHandle}
                onChangeText={setSearchHandle}
                placeholder="Type friend's name or handle (e.g. Maya)..."
                placeholderTextColor={palette.textTertiary}
                style={[styles.searchInput, { color: palette.textPrimary }]}
                autoCapitalize="none"
                onSubmitEditing={handleAddFriend}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.addFriendSubmitBtn,
                {
                  backgroundColor: searchHandle.trim() ? palette.accent : palette.border,
                  marginTop: spacing.md,
                },
              ]}
              disabled={!searchHandle.trim()}
              onPress={handleAddFriend}
            >
              <UserPlus size={16} color={palette.accentInverted} style={{ marginRight: 6 }} />
              <Text style={[styles.addFriendSubmitText, { color: palette.accentInverted }]}>
                Add Friend
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  eyebrow: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  mainTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.tight,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  tabToggleRow: {
    flexDirection: "row",
    padding: 4,
    borderRadius: radii.full,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radii.full,
    alignItems: "center",
  },
  tabBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  list: { gap: spacing.sm },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  statusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  info: { flex: 1, marginLeft: spacing.md },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium },
  handle: { fontSize: typography.sizes.xs },
  listeningRow: { flexDirection: "row", alignItems: "center", marginTop: 3 },
  trackText: { fontSize: typography.sizes.xs },
  offlineText: { fontSize: typography.sizes.xs, marginTop: 3 },
  roomTagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  roomTagText: {
    fontSize: 10,
    fontWeight: typography.weights.medium,
  },
  cardActions: {
    marginLeft: 8,
  },
  joinBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  joinBtnText: {
    color: "#FFF",
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  listenAlongBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  listenAlongText: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
  },
  syncedText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: typography.weights.semibold,
  },
  requestCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  acceptBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  acceptBtnText: {
    color: "#FFFFFF",
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
    marginLeft: 6,
  },
  chatBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  subToggleRow: {
    flexDirection: "row",
    padding: 3,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  subToggleBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm,
  },
  subToggleBtnText: {
    fontSize: typography.sizes.xs,
  },
  sentActionsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sentStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  sentStatusText: {
    fontSize: 10,
    fontWeight: "700",
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

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: 40,
    minHeight: 380,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.sm,
  },
  suggestedList: {
    marginTop: spacing.lg,
    gap: 10,
  },
  suggestedLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: 4,
  },
  suggestedCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  suggestedAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  suggestedName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  suggestedHandle: {
    fontSize: 10,
  },
  sendReqBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  sendReqText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: typography.weights.semibold,
  },
  emptyFriendsCard: {
    padding: spacing.xl,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  emptyFriendsTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptyFriendsSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    maxWidth: 380,
    marginBottom: spacing.md,
  },
  emptyFriendsBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: 10,
  },
  emptyFriendsBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  addFriendSubmitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  addFriendSubmitText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
