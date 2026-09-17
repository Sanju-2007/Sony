import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Shield,
  Music,
  Sliders,
  Radio,
  Clock,
  Sparkles,
  Check,
  Edit3,
  X,
  Eye,
  EyeOff,
  Zap,
  Users,
  UserPlus,
  UserCheck,
  LogOut,
  Play,
  MessageSquare,
  Search,
} from "lucide-react-native";
import { typography, colors, spacing, radii } from "../../src/theme/tokens";
import { useAuthStore } from "../../src/store/authStore";
import { usePlaybackStore, DUCKING_PROFILES, DuckingProfileType } from "../../src/store/playbackStore";

type ProfileTab = "SETTINGS" | "FRIENDS" | "REQUESTS" | "FIND";
type PrivacyMode = "PUBLIC" | "FRIENDS" | "GHOST";

interface FriendItem {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  status: "IN_ROOM" | "ONLINE" | "OFFLINE";
  currentTrack?: string;
  artist?: string;
  roomName?: string;
  roomId?: string;
}

interface FriendRequestItem {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  mutualCount: number;
  message?: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const palette = colors.light;
  const { user, logout } = useAuthStore();
  const { duckingProfile, setDuckingProfile, playTrackImmediate } = usePlaybackStore();

  const [activeTab, setActiveTab] = useState<ProfileTab>("SETTINGS");
  const [privacyMode, setPrivacyMode] = useState<PrivacyMode>("FRIENDS");
  const [hdAudio, setHdAudio] = useState(true);
  const [driftNudge, setDriftNudge] = useState(true);

  // Edit profile state
  const [showEditModal, setShowEditModal] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "Alex Rivers");
  const [bio, setBio] = useState(
    user?.bio || "Deep lo-fi beats, synthwave sunsets, and late night conversations."
  );

  // Friends & Requests state
  const [friendsList, setFriendsList] = useState<FriendItem[]>([
    {
      id: "f1",
      name: "Aisha",
      handle: "@aisha",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&q=80",
      status: "IN_ROOM",
      roomName: "Late Night Family",
      roomId: "room-late-night-1",
      currentTrack: "Midnight Ambient Waves",
      artist: "Sony Sound Collective",
    },
    {
      id: "f2",
      name: "Rahul",
      handle: "@rahul",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop&q=80",
      status: "IN_ROOM",
      roomName: "Late Night Family",
      roomId: "room-late-night-1",
      currentTrack: "Tokyo Rain & Neon Lights",
      artist: "Kaito & Maya",
    },
    {
      id: "f3",
      name: "Priya",
      handle: "@priya",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&fit=crop&q=80",
      status: "ONLINE",
      currentTrack: "Solar Flare Horizon",
      artist: "Aura Electric",
    },
    {
      id: "f4",
      name: "Marcus",
      handle: "@marcus",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&fit=crop&q=80",
      status: "OFFLINE",
    },
  ]);

  const [pendingRequests, setPendingRequests] = useState<FriendRequestItem[]>([
    {
      id: "req-1",
      name: "Devon Miller",
      handle: "@devon_m",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&fit=crop&q=80",
      mutualCount: 3,
      message: "Hey! Loving your lo-fi playlists in the coding room.",
    },
    {
      id: "req-2",
      name: "Sarah Chen",
      handle: "@sarah_c",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&fit=crop&q=80",
      mutualCount: 1,
      message: "Fellow synthwave producer. Let's sync up!",
    },
  ]);

  const [searchFriendQuery, setSearchFriendQuery] = useState("");
  const [sentRequestIds, setSentRequestIds] = useState<Record<string, boolean>>({});

  const stats = [
    { label: "Hours Synced", value: "42.5 h" },
    { label: "Rooms Hosted", value: "14" },
    { label: "Tracks Queued", value: "38" },
    { label: "Sync Precision", value: "<15ms" },
  ];

  const handleAcceptRequest = (req: FriendRequestItem) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== req.id));
    setFriendsList((prev) => [
      ...prev,
      {
        id: req.id,
        name: req.name,
        handle: req.handle,
        avatar: req.avatar,
        status: "ONLINE",
        currentTrack: "Blinding Lights",
        artist: "The Weeknd",
      },
    ]);
  };

  const handleDeclineRequest = (reqId: string) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== reqId));
  };

  const handleSendFriendRequest = (userId: string) => {
    setSentRequestIds((prev) => ({ ...prev, [userId]: true }));
  };

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  const handleListenWithFriend = (friend: FriendItem) => {
    if (friend.roomId) {
      router.push(`/room/${friend.roomId}`);
    } else if (friend.currentTrack) {
      playTrackImmediate({
        id: `track-${friend.id}`,
        provider: "LICENSED_CATALOG",
        providerTrackId: `track-${friend.id}`,
        title: friend.currentTrack,
        artist: friend.artist || "Featured Artist",
        album: "Shared Listening",
        artworkUrl: friend.avatar,
        durationMs: 200000,
        streamUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=chill-abstract-intention-12099.mp3",
      });
      router.push("/room/room-late-night-1");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: palette.textTertiary }]}>· my account & circle</Text>
          <Text style={[styles.mainTitle, { color: palette.textPrimary }]}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
          <View style={[styles.avatarCircle, { backgroundColor: palette.accent }]}>
            <Text style={styles.avatarText}>{displayName.charAt(0) || "A"}</Text>
          </View>
          <Text style={[styles.name, { color: palette.textPrimary }]}>{displayName}</Text>
          <Text style={[styles.handle, { color: palette.textTertiary }]}>@{user?.username || "alex"}</Text>
          <Text style={[styles.bio, { color: palette.textSecondary }]}>{bio}</Text>

          <View style={styles.profileBtnRow}>
            <TouchableOpacity
              style={[styles.editProfileBtn, { backgroundColor: palette.background, borderColor: palette.border }]}
              onPress={() => setShowEditModal(true)}
            >
              <Edit3 size={13} color={palette.textPrimary} style={{ marginRight: 6 }} />
              <Text style={[styles.editProfileText, { color: palette.textPrimary }]}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.logoutBtn, { backgroundColor: "rgba(239, 68, 68, 0.08)", borderColor: "rgba(239, 68, 68, 0.2)" }]}
              onPress={handleLogout}
            >
              <LogOut size={13} color="#EF4444" style={{ marginRight: 6 }} />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Segmented Navigation */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === "SETTINGS" && styles.segmentBtnActive]}
            onPress={() => setActiveTab("SETTINGS")}
          >
            <Sliders size={14} color={activeTab === "SETTINGS" ? "#FFFFFF" : "#71717A"} style={{ marginRight: 6 }} />
            <Text style={[styles.segmentText, activeTab === "SETTINGS" && styles.segmentTextActive]}>
              Settings & Audio
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === "FRIENDS" && styles.segmentBtnActive]}
            onPress={() => setActiveTab("FRIENDS")}
          >
            <Users size={14} color={activeTab === "FRIENDS" ? "#FFFFFF" : "#71717A"} style={{ marginRight: 6 }} />
            <Text style={[styles.segmentText, activeTab === "FRIENDS" && styles.segmentTextActive]}>
              Friends ({friendsList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === "REQUESTS" && styles.segmentBtnActive]}
            onPress={() => setActiveTab("REQUESTS")}
          >
            <UserPlus size={14} color={activeTab === "REQUESTS" ? "#FFFFFF" : "#71717A"} style={{ marginRight: 6 }} />
            <Text style={[styles.segmentText, activeTab === "REQUESTS" && styles.segmentTextActive]}>
              Requests {pendingRequests.length > 0 && `(${pendingRequests.length})`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === "FIND" && styles.segmentBtnActive]}
            onPress={() => setActiveTab("FIND")}
          >
            <Search size={14} color={activeTab === "FIND" ? "#FFFFFF" : "#71717A"} style={{ marginRight: 6 }} />
            <Text style={[styles.segmentText, activeTab === "FIND" && styles.segmentTextActive]}>
              Add Friends
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: SETTINGS & AUDIO */}
        {activeTab === "SETTINGS" && (
          <>
            {/* Listening Statistics */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Listening Analytics</Text>
              <View style={styles.statsGrid}>
                {stats.map((s, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.statCard,
                      { backgroundColor: palette.surface, borderColor: palette.borderSubtle },
                    ]}
                  >
                    <Text style={[styles.statValue, { color: palette.textPrimary }]}>{s.value}</Text>
                    <Text style={[styles.statLabel, { color: palette.textTertiary }]}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Playback & Sync Engine Preferences */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Audio Engine Preferences</Text>

              <View style={[styles.menuItem, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
                <View style={styles.menuLeft}>
                  <Radio size={16} color={palette.textSecondary} style={{ marginRight: 10 }} />
                  <View>
                    <Text style={[styles.menuText, { color: palette.textPrimary }]}>HD WebRTC Opus (48kHz)</Text>
                    <Text style={[styles.menuSubtext, { color: palette.textTertiary }]}>Studio grade 160kbps low-latency voice</Text>
                  </View>
                </View>
                <Switch
                  value={hdAudio}
                  onValueChange={setHdAudio}
                  trackColor={{ true: palette.speaking, false: palette.border }}
                />
              </View>

              <View style={[styles.menuItem, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
                <View style={styles.menuLeft}>
                  <Zap size={16} color={palette.textSecondary} style={{ marginRight: 10 }} />
                  <View>
                    <Text style={[styles.menuText, { color: palette.textPrimary }]}>Micro-Drift Pitch Correction</Text>
                    <Text style={[styles.menuSubtext, { color: palette.textTertiary }]}>Nudge rate (0.95x / 1.05x) without clicks</Text>
                  </View>
                </View>
                <Switch
                  value={driftNudge}
                  onValueChange={setDriftNudge}
                  trackColor={{ true: palette.speaking, false: palette.border }}
                />
              </View>

              {/* Ducking Profile Picker */}
              <View style={[styles.duckingSelectorCard, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
                <View style={styles.menuLeft}>
                  <Sliders size={16} color={palette.textSecondary} style={{ marginRight: 10 }} />
                  <Text style={[styles.menuText, { color: palette.textPrimary }]}>Default Ducking Profile</Text>
                </View>
                <View style={styles.duckingOptionsRow}>
                  {(Object.keys(DUCKING_PROFILES) as DuckingProfileType[]).map((prof) => {
                    const isSelected = duckingProfile === prof;
                    return (
                      <TouchableOpacity
                        key={prof}
                        style={[
                          styles.duckingOptionPill,
                          {
                            backgroundColor: isSelected ? palette.textPrimary : palette.background,
                            borderColor: isSelected ? palette.textPrimary : palette.border,
                          },
                        ]}
                        onPress={() => setDuckingProfile(prof)}
                      >
                        <Text
                          style={[
                            styles.duckingOptionText,
                            { color: isSelected ? "#FFFFFF" : palette.textSecondary },
                          ]}
                        >
                          {prof === "SING_TOGETHER" ? "Sing (40%)" : prof === "PODCAST_DJ" ? "DJ (20%)" : prof === "SUBTLE" ? "Subtle (65%)" : "Off"}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Presence & Privacy Modes */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Social Presence & Privacy</Text>

              <View style={styles.privacyModesRow}>
                {[
                  { id: "PUBLIC", label: "Public", desc: "Visible to anyone", icon: Eye },
                  { id: "FRIENDS", label: "Friends Only", desc: "Mutuals only", icon: Shield },
                  { id: "GHOST", label: "Ghost Mode", desc: "Hidden presence", icon: EyeOff },
                ].map((p) => {
                  const isSelected = privacyMode === p.id;
                  const IconComp = p.icon;
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.privacyModeCard,
                        {
                          backgroundColor: isSelected ? palette.textPrimary : palette.surface,
                          borderColor: isSelected ? palette.textPrimary : palette.borderSubtle,
                        },
                      ]}
                      onPress={() => setPrivacyMode(p.id as PrivacyMode)}
                    >
                      <IconComp size={16} color={isSelected ? "#FFFFFF" : palette.textPrimary} />
                      <Text
                        style={[
                          styles.privacyModeTitle,
                          { color: isSelected ? "#FFFFFF" : palette.textPrimary },
                        ]}
                      >
                        {p.label}
                      </Text>
                      <Text
                        style={[
                          styles.privacyModeDesc,
                          { color: isSelected ? "rgba(255,255,255,0.7)" : palette.textTertiary },
                        ]}
                      >
                        {p.desc}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
        )}

        {/* TAB 2: FRIENDS LIST */}
        {activeTab === "FRIENDS" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
                My Friends ({friendsList.length})
              </Text>
              <Text style={styles.sectionSub}>Live listening status across active rooms</Text>
            </View>

            <View style={styles.friendsList}>
              {friendsList.map((friend) => (
                <View key={friend.id} style={styles.friendCard}>
                  <Image source={{ uri: friend.avatar }} style={styles.friendAvatar} />
                  <View style={styles.friendInfo}>
                    <View style={styles.friendNameRow}>
                      <Text style={styles.friendName}>{friend.name}</Text>
                      <Text style={styles.friendHandle}>{friend.handle}</Text>
                    </View>

                    {friend.status === "IN_ROOM" && (
                      <View style={styles.friendActivityRow}>
                        <View style={[styles.statusDot, { backgroundColor: "#10B981" }]} />
                        <Text style={styles.friendActivityText} numberOfLines={1}>
                          In <Text style={{ fontWeight: "700" }}>{friend.roomName}</Text> · {friend.currentTrack}
                        </Text>
                      </View>
                    )}

                    {friend.status === "ONLINE" && (
                      <View style={styles.friendActivityRow}>
                        <View style={[styles.statusDot, { backgroundColor: "#3B82F6" }]} />
                        <Text style={styles.friendActivityText} numberOfLines={1}>
                          Listening to {friend.currentTrack}
                        </Text>
                      </View>
                    )}

                    {friend.status === "OFFLINE" && (
                      <View style={styles.friendActivityRow}>
                        <View style={[styles.statusDot, { backgroundColor: "#A1A1AA" }]} />
                        <Text style={styles.friendActivityTextOffline}>Offline</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.friendActions}>
                    {friend.status !== "OFFLINE" && (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.listenWithBtn}
                        onPress={() => handleListenWithFriend(friend)}
                      >
                        <Play size={13} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 4 }} />
                        <Text style={styles.listenWithBtnText}>Listen</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.chatFriendBtn}
                      onPress={() => router.push("/(tabs)/messages")}
                    >
                      <MessageSquare size={14} color="#0A0A0A" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* TAB 3: FRIEND REQUESTS */}
        {activeTab === "REQUESTS" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
                Pending Requests ({pendingRequests.length})
              </Text>
              <Text style={styles.sectionSub}>Accept to share synchronized rooms and spatial voice</Text>
            </View>

            {pendingRequests.length === 0 ? (
              <View style={styles.emptyCard}>
                <UserCheck size={36} color="#10B981" style={{ marginBottom: 10 }} />
                <Text style={styles.emptyTitle}>You're all caught up!</Text>
                <Text style={styles.emptySub}>No pending friend requests at this time.</Text>
              </View>
            ) : (
              <View style={styles.requestsList}>
                {pendingRequests.map((req) => (
                  <View key={req.id} style={styles.requestCard}>
                    <Image source={{ uri: req.avatar }} style={styles.friendAvatar} />
                    <View style={styles.requestInfo}>
                      <View style={styles.friendNameRow}>
                        <Text style={styles.friendName}>{req.name}</Text>
                        <Text style={styles.friendHandle}>{req.handle}</Text>
                      </View>
                      <Text style={styles.mutualText}>
                        {req.mutualCount} mutual listening friends
                      </Text>
                      {req.message && (
                        <Text style={styles.requestMessage}>"{req.message}"</Text>
                      )}
                    </View>

                    <View style={styles.requestActions}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.acceptBtn}
                        onPress={() => handleAcceptRequest(req)}
                      >
                        <Check size={14} color="#FFFFFF" strokeWidth={2.4} style={{ marginRight: 4 }} />
                        <Text style={styles.acceptBtnText}>Accept</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.declineBtn}
                        onPress={() => handleDeclineRequest(req.id)}
                      >
                        <X size={14} color="#71717A" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* TAB 4: FIND & ADD FRIENDS */}
        {activeTab === "FIND" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
                Discover Audiophiles
              </Text>
              <Text style={styles.sectionSub}>Search users or add mutual friends across rooms</Text>
            </View>

            <View style={styles.searchBar}>
              <Search size={16} color="#71717A" style={{ marginRight: 10 }} />
              <TextInput
                value={searchFriendQuery}
                onChangeText={setSearchFriendQuery}
                placeholder="Search username, handle, or music taste..."
                placeholderTextColor="#A1A1AA"
                style={styles.searchInput}
              />
            </View>

            <View style={styles.suggestionsList}>
              {[
                {
                  id: "sug-1",
                  name: "Elena Rostova",
                  handle: "@elena_r",
                  genre: "Acoustic & Vinyl",
                  avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&fit=crop&q=80",
                },
                {
                  id: "sug-2",
                  name: "Kai Takahashi",
                  handle: "@kaito_sound",
                  genre: "Lo-Fi Beats & Anime",
                  avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&fit=crop&q=80",
                },
                {
                  id: "sug-3",
                  name: "Maya Lin",
                  handle: "@maya_synth",
                  genre: "Synthwave & Future Funk",
                  avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&fit=crop&q=80",
                },
              ].map((sug) => {
                const isSent = !!sentRequestIds[sug.id];
                return (
                  <View key={sug.id} style={styles.suggestionCard}>
                    <Image source={{ uri: sug.avatar }} style={styles.friendAvatar} />
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{sug.name}</Text>
                      <Text style={styles.friendHandle}>{sug.handle} · {sug.genre}</Text>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[
                        styles.addFriendBtn,
                        isSent && { backgroundColor: "rgba(16, 185, 129, 0.12)", borderColor: "#10B981" },
                      ]}
                      onPress={() => handleSendFriendRequest(sug.id)}
                      disabled={isSent}
                    >
                      {isSent ? (
                        <>
                          <Check size={13} color="#10B981" style={{ marginRight: 4 }} />
                          <Text style={[styles.addFriendText, { color: "#10B981" }]}>Sent</Text>
                        </>
                      ) : (
                        <>
                          <UserPlus size={13} color="#0A0A0A" style={{ marginRight: 4 }} />
                          <Text style={styles.addFriendText}>Add</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={[styles.modalBox, { backgroundColor: palette.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: palette.textPrimary }]}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={18} color={palette.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalField}>
              <Text style={[styles.modalLabel, { color: palette.textTertiary }]}>DISPLAY NAME</Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: palette.background,
                    borderColor: palette.border,
                    color: palette.textPrimary,
                  },
                ]}
              />
            </View>

            <View style={styles.modalField}>
              <Text style={[styles.modalLabel, { color: palette.textTertiary }]}>BIO</Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
                style={[
                  styles.modalTextarea,
                  {
                    backgroundColor: palette.background,
                    borderColor: palette.border,
                    color: palette.textPrimary,
                  },
                ]}
              />
            </View>

            <TouchableOpacity
              style={[styles.modalSaveBtn, { backgroundColor: palette.accent }]}
              onPress={() => setShowEditModal(false)}
            >
              <Text style={styles.modalSaveText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 110,
    maxWidth: 960,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  mainTitle: {
    fontSize: typography.sizes["2xl"],
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.tight,
  },
  profileCard: {
    alignItems: "center",
    padding: spacing.xl,
    borderRadius: radii.xl,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  name: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.tight,
  },
  handle: {
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  bio: {
    fontSize: typography.sizes.sm,
    textAlign: "center",
    marginTop: spacing.sm,
    lineHeight: 20,
    maxWidth: 380,
  },
  profileBtnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: spacing.md,
  },
  editProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  editProfileText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: "#EF4444",
  },
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    borderRadius: 14,
    padding: 4,
    marginBottom: spacing.xl,
    flexWrap: "wrap",
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    minWidth: 120,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: "#0A0A0A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#71717A",
  },
  segmentTextActive: {
    color: "#FFFFFF",
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.tight,
  },
  sectionSub: {
    fontSize: 12,
    color: "#71717A",
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    marginTop: spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: 140,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  statValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    marginTop: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  menuSubtext: {
    fontSize: 11,
    marginTop: 2,
  },
  duckingSelectorCard: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  duckingOptionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: spacing.sm,
  },
  duckingOptionPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    alignItems: "center",
  },
  duckingOptionText: {
    fontSize: 10,
    fontWeight: typography.weights.medium,
  },
  privacyModesRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: spacing.sm,
  },
  privacyModeCard: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: "center",
    gap: 3,
  },
  privacyModeTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    marginTop: 2,
  },
  privacyModeDesc: {
    fontSize: 9,
    textAlign: "center",
  },
  // Friends & Requests Tab Styles
  friendsList: {
    gap: 10,
  },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    padding: 12,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
  },
  friendAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#F4F4F5",
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  friendNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  friendName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0A0A0A",
  },
  friendHandle: {
    fontSize: 12,
    color: "#71717A",
  },
  friendActivityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  friendActivityText: {
    fontSize: 12,
    color: "#52525B",
  },
  friendActivityTextOffline: {
    fontSize: 12,
    color: "#A1A1AA",
  },
  friendActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  listenWithBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  listenWithBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  chatFriendBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  requestsList: {
    gap: 10,
  },
  requestCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    padding: 14,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
  },
  requestInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  mutualText: {
    fontSize: 11,
    color: "#71717A",
    marginTop: 2,
  },
  requestMessage: {
    fontSize: 12,
    color: "#0A0A0A",
    fontStyle: "italic",
    marginTop: 4,
  },
  requestActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  acceptBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  acceptBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  declineBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0A0A0A",
  },
  emptySub: {
    fontSize: 13,
    color: "#71717A",
    marginTop: 4,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#0A0A0A",
    // @ts-ignore
    outlineStyle: "none",
  },
  suggestionsList: {
    gap: 10,
  },
  suggestionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    padding: 12,
    borderRadius: 14,
  },
  addFriendBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addFriendText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0A0A0A",
  },
  // Modal
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  modalBox: {
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: 14,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  modalField: {
    gap: 6,
  },
  modalLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.wider,
  },
  modalInput: {
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.sm,
  },
  modalTextarea: {
    height: 80,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    fontSize: typography.sizes.sm,
    textAlignVertical: "top",
  },
  modalSaveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 46,
    borderRadius: radii.full,
    marginTop: 4,
  },
  modalSaveText: {
    color: "#FFFFFF",
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
});
