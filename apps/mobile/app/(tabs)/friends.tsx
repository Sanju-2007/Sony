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
  Music,
  Radio,
  Headphones,
  Check,
  Search,
  X,
  Sparkles,
} from "lucide-react-native";
import { typography, colors, spacing, radii } from "../../src/theme/tokens";
import { usePlaybackStore } from "../../src/store/playbackStore";
import { CATALOG_TRACKS } from "../../src/components/music/MusicSearchModal";

interface FriendActivity {
  id: string;
  name: string;
  handle: string;
  status: "IN_ROOM" | "ONLINE" | "OFFLINE";
  roomName?: string;
  roomId?: string;
  trackTitle?: string;
  trackArtist?: string;
  avatar: string;
}

export default function FriendsScreen() {
  const router = useRouter();
  const palette = colors.light;
  const { playTrackImmediate } = usePlaybackStore();

  const [activeTab, setActiveTab] = useState<"activity" | "requests">("activity");
  const [syncedFriendId, setSyncedFriendId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchHandle, setSearchHandle] = useState("");
  const [addedHandles, setAddedHandles] = useState<Record<string, boolean>>({});

  const friends: FriendActivity[] = [
    {
      id: "f1",
      name: "Aisha",
      handle: "@aisha",
      status: "IN_ROOM",
      roomName: "Late Night Family",
      roomId: "room-late-night-1",
      trackTitle: "Midnight Ambient Waves",
      trackArtist: "Sony Sound Collective",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&q=80",
    },
    {
      id: "f2",
      name: "Rahul",
      handle: "@rahul",
      status: "IN_ROOM",
      roomName: "Late Night Family",
      roomId: "room-late-night-1",
      trackTitle: "Tokyo Rain & Neon Lights",
      trackArtist: "Kaito & Maya",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop&q=80",
    },
    {
      id: "f3",
      name: "Priya",
      handle: "@priya",
      status: "ONLINE",
      trackTitle: "Solar Flare Horizon",
      trackArtist: "Aura Electric",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&fit=crop&q=80",
    },
    {
      id: "f4",
      name: "Marcus",
      handle: "@marcus",
      status: "OFFLINE",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&fit=crop&q=80",
    },
  ];

  const friendRequests = [
    {
      id: "req-1",
      name: "Devon Miller",
      handle: "@devon_m",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&fit=crop&q=80",
      mutualCount: 3,
    },
  ];

  const handleListenAlong = (friend: FriendActivity) => {
    if (!friend.trackTitle) return;
    const matchingTrack = CATALOG_TRACKS.find(
      (t) =>
        t.title.toLowerCase() === friend.trackTitle?.toLowerCase() ||
        t.artist.toLowerCase() === friend.trackArtist?.toLowerCase()
    ) || CATALOG_TRACKS[0];

    playTrackImmediate(matchingTrack);
    setSyncedFriendId(friend.id);
    setTimeout(() => setSyncedFriendId(null), 2500);
  };

  const handleSendRequest = (handle: string) => {
    setAddedHandles((prev) => ({ ...prev, [handle]: true }));
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
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: palette.surface, borderColor: palette.border }]}
            onPress={() => setShowAddModal(true)}
          >
            <UserPlus size={18} color={palette.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Tab Toggle (Activity vs Requests) */}
        <View style={[styles.tabToggleRow, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === "activity" && { backgroundColor: palette.textPrimary },
            ]}
            onPress={() => setActiveTab("activity")}
          >
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === "activity" ? "#FFFFFF" : palette.textSecondary },
              ]}
            >
              Listening Activity ({friends.filter((f) => f.status !== "OFFLINE").length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === "requests" && { backgroundColor: palette.textPrimary },
            ]}
            onPress={() => setActiveTab("requests")}
          >
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === "requests" ? "#FFFFFF" : palette.textSecondary },
              ]}
            >
              Requests ({friendRequests.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* ACTIVE TAB: ACTIVITY */}
        {activeTab === "activity" && (
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

                    {f.trackTitle ? (
                      <View style={styles.listeningRow}>
                        <Music size={11} color={palette.speaking} style={{ marginRight: 4 }} />
                        <Text style={[styles.trackText, { color: palette.textSecondary }]} numberOfLines={1}>
                          {f.trackTitle} · {f.trackArtist}
                        </Text>
                      </View>
                    ) : (
                      <Text style={[styles.offlineText, { color: palette.textTertiary }]}>Currently offline</Text>
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
                        style={[styles.joinBtn, { backgroundColor: palette.textPrimary }]}
                        onPress={() => router.push("/room/" + f.roomId)}
                      >
                        <Text style={styles.joinBtnText}>Join Room</Text>
                      </TouchableOpacity>
                    )}

                    {f.trackTitle && f.status !== "IN_ROOM" && (
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
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ACTIVE TAB: REQUESTS */}
        {activeTab === "requests" && (
          <View style={styles.list}>
            {friendRequests.map((r) => (
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
                  style={[styles.acceptBtn, { backgroundColor: palette.textPrimary }]}
                  onPress={() => {}}
                >
                  <Text style={styles.acceptBtnText}>Accept</Text>
                </TouchableOpacity>
              </View>
            ))}
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
                <Text style={[styles.modalTitle, { color: palette.textPrimary }]}>Find & Add Friends</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={20} color={palette.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={[styles.searchBox, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              <Search size={16} color={palette.textTertiary} style={{ marginRight: 8 }} />
              <TextInput
                value={searchHandle}
                onChangeText={setSearchHandle}
                placeholder="Search by username or handle..."
                placeholderTextColor={palette.textTertiary}
                style={[styles.searchInput, { color: palette.textPrimary }]}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.suggestedList}>
              <Text style={[styles.suggestedLabel, { color: palette.textTertiary }]}>SUGGESTED FROM SOCIAL CIRCLE</Text>
              {[
                { name: "Elena Rostova", handle: "@elena_sound", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&fit=crop&q=80" },
                { name: "Kaito Tanaka", handle: "@kaito_shibuya", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&fit=crop&q=80" },
              ].map((s) => {
                const isSent = !!addedHandles[s.handle];
                return (
                  <View
                    key={s.handle}
                    style={[
                      styles.suggestedCard,
                      { backgroundColor: palette.surface, borderColor: palette.borderSubtle },
                    ]}
                  >
                    <Image source={{ uri: s.avatar }} style={styles.suggestedAvatar} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.suggestedName, { color: palette.textPrimary }]}>{s.name}</Text>
                      <Text style={[styles.suggestedHandle, { color: palette.textTertiary }]}>{s.handle}</Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.sendReqBtn,
                        {
                          backgroundColor: isSent ? palette.speaking : palette.textPrimary,
                        },
                      ]}
                      onPress={() => handleSendRequest(s.handle)}
                    >
                      <Text style={styles.sendReqText}>{isSent ? "Sent ✓" : "Connect"}</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
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
});
