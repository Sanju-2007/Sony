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
  Sun,
  Moon,
  Headphones,
  ArrowRight,
} from "lucide-react-native";
import { typography, spacing, radii } from "../../src/theme/tokens";
import { useAuthStore } from "../../src/store/authStore";
import { usePlaybackStore, DUCKING_PROFILES, DuckingProfileType } from "../../src/store/playbackStore";
import { useThemeStore } from "../../src/store/themeStore";
import { ThemeToggleButton } from "../../src/components/theme/ThemeToggleButton";
import { LoginToListenModal } from "../../src/components/auth/LoginToListenModal";
import { useChatStore } from "../../src/store/chatStore";
import { youtubeMusicService } from "../../src/services/youtubeMusicService";

import { useSocialStore, FriendItem, FriendRequestItem } from "../../src/store/socialStore";
import { useRoomsStore } from "../../src/store/roomsStore";

type ProfileTab = "SETTINGS" | "FRIENDS" | "REQUESTS" | "FIND";
type PrivacyMode = "PUBLIC" | "FRIENDS" | "GHOST";

export default function ProfileScreen() {
  const router = useRouter();
  const { isDark, palette, toggleTheme } = useThemeStore();
  const { user, logout, updateProfile } = useAuthStore();
  const { rooms } = useRoomsStore();
  const { friends, pendingRequests, acceptRequest, declineRequest, addFriend, sendRequest, sentRequests } = useSocialStore();
  const { duckingProfile, setDuckingProfile, playTrackImmediate } = usePlaybackStore();

  const [activeTab, setActiveTab] = useState<ProfileTab>("SETTINGS");
  const [privacyMode, setPrivacyMode] = useState<PrivacyMode>("FRIENDS");
  const [hdAudio, setHdAudio] = useState(true);
  const [driftNudge, setDriftNudge] = useState(true);

  // YouTube API Key state
  const [ytApiKey, setYtApiKey] = useState(youtubeMusicService.getStoredApiKey());
  const [isTestingYtKey, setIsTestingYtKey] = useState(false);
  const [ytKeyStatus, setYtKeyStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">(
    youtubeMusicService.getStoredApiKey() ? "SUCCESS" : "IDLE"
  );
  const [ytKeyMessage, setYtKeyMessage] = useState(
    youtubeMusicService.getStoredApiKey()
      ? "YouTube Data API v3 key active."
      : "Using built-in multi-source YouTube audio streaming engine."
  );

  const handleSaveAndTestYtKey = async () => {
    youtubeMusicService.setStoredApiKey(ytApiKey);
    if (!ytApiKey.trim()) {
      setYtKeyStatus("IDLE");
      setYtKeyMessage("Using built-in multi-source YouTube audio streaming engine.");
      return;
    }

    setIsTestingYtKey(true);
    const res = await youtubeMusicService.testApiKey(ytApiKey);
    setIsTestingYtKey(false);

    if (res.valid) {
      setYtKeyStatus("SUCCESS");
      setYtKeyMessage("✅ Active! Connected to official YouTube Data API v3.");
    } else {
      setYtKeyStatus("ERROR");
      setYtKeyMessage(`⚠️ ${res.error || "Could not verify key. Stored for retry."}`);
    }
  };

  // Edit profile & Auth states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "Listener");
  const [bio, setBio] = useState(
    user?.bio || "Deep lo-fi beats, synthwave sunsets, and late night conversations."
  );

  React.useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      if (user.bio) setBio(user.bio);
    }
  }, [user]);

  const [searchFriendQuery, setSearchFriendQuery] = useState("");

  const hostedRoomsCount = user
    ? rooms.filter((r) => r.ownerId === user.id).length
    : 0;

  const friendsConnectedCount = user ? friends.length : 0;

  const stats = [
    { label: "Rooms Hosted", value: String(hostedRoomsCount) },
    { label: "Friends Connected", value: String(friendsConnectedCount) },
    { label: "Sync Precision", value: "<10ms" },
    { label: "Opus Audio", value: "48kHz" },
  ];

  const handleSaveProfile = () => {
    updateProfile({ displayName, bio });
    setShowEditModal(false);
  };

  const handleAddDirectFriend = (handleOrName: string) => {
    if (!handleOrName.trim()) return;
    const raw = handleOrName.trim().replace(/^@/, "");
    const newFriend: FriendItem = {
      id: "friend-" + Date.now(),
      name: raw.charAt(0).toUpperCase() + raw.slice(1),
      handle: "@" + raw.toLowerCase(),
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&fit=crop&q=80",
      status: "ONLINE",
    };
    sendRequest(newFriend);
    addFriend(newFriend);
    setSearchFriendQuery("");
  };

  const handleAcceptRequest = (req: FriendRequestItem) => {
    acceptRequest(req);
  };

  const handleDeclineRequest = (reqId: string) => {
    declineRequest(reqId);
  };

  const handleSendFriendRequest = (userId: string) => {
    sendRequest(userId);
  };

  const handleLogout = () => {
    logout();
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
        <View style={[styles.header, { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }]}>
          <View>
            <Text style={[styles.eyebrow, { color: palette.textTertiary }]}>· my account & circle</Text>
            <Text style={[styles.mainTitle, { color: palette.textPrimary }]}>Profile</Text>
          </View>
          <ThemeToggleButton showLabel />
        </View>

        {/* Profile Card / Login to Listen Card */}
        {!user ? (
          <View
            style={[
              styles.loginToListenCard,
              {
                backgroundColor: palette.surface,
                borderColor: palette.borderSubtle,
              },
            ]}
          >
            <View
              style={[
                styles.loginIconCircle,
                { backgroundColor: palette.accent },
              ]}
            >
              <Headphones size={36} color={palette.accentInverted} />
            </View>
            <Text style={[styles.loginCardTitle, { color: palette.textPrimary }]}>
              Login to Listen
            </Text>
            <Text
              style={[
                styles.loginCardSubtitle,
                { color: palette.textSecondary },
              ]}
            >
              Create your sound identity with a unique User ID to host live synchronized listening rooms, chat in real-time, and connect with friends.
            </Text>

            <TouchableOpacity
              style={[styles.loginCtaBtn, { backgroundColor: palette.accent }]}
              onPress={() => setShowAuthModal(true)}
              activeOpacity={0.88}
            >
              <Text
                style={[
                  styles.loginCtaBtnText,
                  { color: palette.accentInverted },
                ]}
              >
                Login or Create Profile
              </Text>
              <ArrowRight
                size={16}
                color={palette.accentInverted}
                style={{ marginLeft: 6 }}
              />
            </TouchableOpacity>

            <View style={styles.featuresPillsRow}>
              <View
                style={[
                  styles.featurePill,
                  {
                    backgroundColor: palette.background,
                    borderColor: palette.borderSubtle,
                  },
                ]}
              >
                <Radio
                  size={12}
                  color={palette.speaking}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.featurePillText,
                    { color: palette.textSecondary },
                  ]}
                >
                  Live Sync Audio
                </Text>
              </View>

              <View
                style={[
                  styles.featurePill,
                  {
                    backgroundColor: palette.background,
                    borderColor: palette.borderSubtle,
                  },
                ]}
              >
                <Sparkles
                  size={12}
                  color={palette.accent}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.featurePillText,
                    { color: palette.textSecondary },
                  ]}
                >
                  Unique User ID
                </Text>
              </View>

              <View
                style={[
                  styles.featurePill,
                  {
                    backgroundColor: palette.background,
                    borderColor: palette.borderSubtle,
                  },
                ]}
              >
                <Users
                  size={12}
                  color={palette.textPrimary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.featurePillText,
                    { color: palette.textSecondary },
                  ]}
                >
                  Friend Circles
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.profileCard,
              {
                backgroundColor: palette.surface,
                borderColor: palette.borderSubtle,
              },
            ]}
          >
            <View
              style={[
                styles.avatarCircle,
                { backgroundColor: palette.accent },
              ]}
            >
              <Text
                style={[
                  styles.avatarText,
                  { color: palette.accentInverted },
                ]}
              >
                {displayName.charAt(0) || "U"}
              </Text>
            </View>
            <Text style={[styles.name, { color: palette.textPrimary }]}>
              {displayName}
            </Text>
            <Text style={[styles.handle, { color: palette.textTertiary }]}>
              @{user.username}
            </Text>
            <Text style={[styles.bio, { color: palette.textSecondary }]}>
              {bio}
            </Text>

            <View style={styles.profileBtnRow}>
              <TouchableOpacity
                style={[
                  styles.editProfileBtn,
                  {
                    backgroundColor: palette.background,
                    borderColor: palette.border,
                  },
                ]}
                onPress={() => setShowEditModal(true)}
              >
                <Edit3
                  size={13}
                  color={palette.textPrimary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.editProfileText,
                    { color: palette.textPrimary },
                  ]}
                >
                  Edit Profile
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.logoutBtn,
                  {
                    backgroundColor: "rgba(239, 68, 68, 0.08)",
                    borderColor: "rgba(239, 68, 68, 0.2)",
                  },
                ]}
                onPress={handleLogout}
              >
                <LogOut size={13} color="#EF4444" style={{ marginRight: 6 }} />
                <Text style={styles.logoutText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Segmented Navigation */}
        <View style={[styles.segmentContainer, { backgroundColor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)" }]}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === "SETTINGS" && [styles.segmentBtnActive, { backgroundColor: palette.accent }]]}
            onPress={() => setActiveTab("SETTINGS")}
          >
            <Sliders size={14} color={activeTab === "SETTINGS" ? palette.accentInverted : palette.textTertiary} style={{ marginRight: 6 }} />
            <Text style={[styles.segmentText, { color: activeTab === "SETTINGS" ? palette.accentInverted : palette.textTertiary }]}>
              Settings & Audio
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === "FRIENDS" && [styles.segmentBtnActive, { backgroundColor: palette.accent }]]}
            onPress={() => setActiveTab("FRIENDS")}
          >
            <Users size={14} color={activeTab === "FRIENDS" ? palette.accentInverted : palette.textTertiary} style={{ marginRight: 6 }} />
            <Text style={[styles.segmentText, { color: activeTab === "FRIENDS" ? palette.accentInverted : palette.textTertiary }]}>
              Friends ({friends.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === "REQUESTS" && [styles.segmentBtnActive, { backgroundColor: palette.accent }]]}
            onPress={() => setActiveTab("REQUESTS")}
          >
            <UserPlus size={14} color={activeTab === "REQUESTS" ? palette.accentInverted : palette.textTertiary} style={{ marginRight: 6 }} />
            <Text style={[styles.segmentText, { color: activeTab === "REQUESTS" ? palette.accentInverted : palette.textTertiary }]}>
              Requests {pendingRequests.length > 0 && `(${pendingRequests.length})`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === "FIND" && [styles.segmentBtnActive, { backgroundColor: palette.accent }]]}
            onPress={() => setActiveTab("FIND")}
          >
            <Search size={14} color={activeTab === "FIND" ? palette.accentInverted : palette.textTertiary} style={{ marginRight: 6 }} />
            <Text style={[styles.segmentText, { color: activeTab === "FIND" ? palette.accentInverted : palette.textTertiary }]}>
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
              <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Appearance & Theme</Text>

              <View style={[styles.menuItem, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
                <View style={styles.menuLeft}>
                  {isDark ? (
                    <Moon size={16} color={palette.speaking} style={{ marginRight: 10 }} />
                  ) : (
                    <Sun size={16} color="#F59E0B" style={{ marginRight: 10 }} />
                  )}
                  <View>
                    <Text style={[styles.menuText, { color: palette.textPrimary }]}>Dark Mode</Text>
                    <Text style={[styles.menuSubtext, { color: palette.textTertiary }]}>
                      {isDark ? "Deep obsidian canvas & luminous highlights" : "Crisp white canvas & clean typography"}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ true: palette.speaking, false: palette.border }}
                />
              </View>
            </View>

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
                            backgroundColor: isSelected ? palette.accent : palette.background,
                            borderColor: isSelected ? palette.accent : palette.border,
                          },
                        ]}
                        onPress={() => setDuckingProfile(prof)}
                      >
                        <Text
                          style={[
                            styles.duckingOptionText,
                            { color: isSelected ? palette.accentInverted : palette.textSecondary },
                          ]}
                        >
                          {prof === "SING_TOGETHER" ? "Sing (40%)" : prof === "PODCAST_DJ" ? "DJ (20%)" : prof === "SUBTLE" ? "Subtle (65%)" : "Off"}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* YouTube Audio Engine & API Key Configuration */}
              <View
                style={[
                  styles.duckingSelectorCard,
                  {
                    backgroundColor: palette.surface,
                    borderColor: palette.borderSubtle,
                    marginTop: spacing.md,
                  },
                ]}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: spacing.xs,
                  }}
                >
                  <View style={styles.menuLeft}>
                    <Music size={16} color="#EF4444" style={{ marginRight: 10 }} />
                    <View>
                      <Text style={[styles.menuText, { color: palette.textPrimary }]}>
                        YouTube Audio Streaming Engine
                      </Text>
                      <Text style={[styles.menuSubtext, { color: palette.textTertiary }]}>
                        Full complete songs (3-5 min) with live room synchronization
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: radii.full,
                      backgroundColor: "rgba(16, 185, 129, 0.12)",
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: "700", color: "#10B981" }}>
                      ● FULL AUDIO ACTIVE
                    </Text>
                  </View>
                </View>

                <View style={{ marginTop: spacing.sm }}>
                  <Text
                    style={{
                      color: palette.textSecondary,
                      marginBottom: 4,
                      fontSize: 11,
                      fontWeight: "600",
                    }}
                  >
                    Custom YouTube Data API v3 Key (Optional)
                  </Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TextInput
                      value={ytApiKey}
                      onChangeText={setYtApiKey}
                      placeholder="Paste your API key (e.g. AIzaSy...)"
                      placeholderTextColor={palette.textTertiary}
                      secureTextEntry
                      style={{
                        flex: 1,
                        height: 38,
                        backgroundColor: palette.background,
                        borderWidth: 1,
                        borderColor: palette.border,
                        borderRadius: radii.md,
                        paddingHorizontal: 10,
                        color: palette.textPrimary,
                        fontSize: 12,
                      }}
                    />
                    <TouchableOpacity
                      style={{
                        paddingHorizontal: 14,
                        height: 38,
                        borderRadius: radii.md,
                        backgroundColor: palette.accent,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onPress={handleSaveAndTestYtKey}
                      disabled={isTestingYtKey}
                    >
                      <Text
                        style={{
                          color: palette.accentInverted,
                          fontSize: 12,
                          fontWeight: "700",
                        }}
                      >
                        {isTestingYtKey ? "Testing..." : "Save Key"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {ytKeyMessage.length > 0 && (
                    <Text
                      style={{
                        fontSize: 11,
                        marginTop: 6,
                        color:
                          ytKeyStatus === "SUCCESS"
                            ? "#10B981"
                            : ytKeyStatus === "ERROR"
                            ? "#EF4444"
                            : palette.textTertiary,
                      }}
                    >
                      {ytKeyMessage}
                    </Text>
                  )}
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
                          backgroundColor: isSelected ? palette.accent : palette.surface,
                          borderColor: isSelected ? palette.accent : palette.borderSubtle,
                        },
                      ]}
                      onPress={() => setPrivacyMode(p.id as PrivacyMode)}
                    >
                      <IconComp size={16} color={isSelected ? palette.accentInverted : palette.textPrimary} />
                      <Text
                        style={[
                          styles.privacyModeTitle,
                          { color: isSelected ? palette.accentInverted : palette.textPrimary },
                        ]}
                      >
                        {p.label}
                      </Text>
                      <Text
                        style={[
                          styles.privacyModeDesc,
                          { color: isSelected ? (isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)") : palette.textTertiary },
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
                My Friends ({friends.length})
              </Text>
              <Text style={[styles.sectionSub, { color: palette.textTertiary }]}>Live listening status across active rooms</Text>
            </View>

            {friends.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
                <Users size={36} color={palette.accent} style={{ marginBottom: 10 }} />
                <Text style={[styles.emptyTitle, { color: palette.textPrimary }]}>No friends added yet</Text>
                <Text style={[styles.emptySub, { color: palette.textTertiary }]}>
                  Connect with friends to listen together, share rooms, and talk in real time.
                </Text>
                <TouchableOpacity
                  style={[styles.emptyActionBtn, { backgroundColor: palette.accent }]}
                  onPress={() => setActiveTab("FIND")}
                >
                  <UserPlus size={14} color={palette.accentInverted} style={{ marginRight: 6 }} />
                  <Text style={[styles.emptyActionBtnText, { color: palette.accentInverted }]}>Add Friends</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.friendsList}>
                {friends.map((friend) => (
                  <View
                    key={friend.id}
                    style={[
                      styles.friendCard,
                      { backgroundColor: palette.surface, borderColor: palette.borderSubtle },
                    ]}
                  >
                    <Image source={{ uri: friend.avatar }} style={styles.friendAvatar} />
                    <View style={styles.friendInfo}>
                      <View style={styles.friendNameRow}>
                        <Text style={[styles.friendName, { color: palette.textPrimary }]}>{friend.name}</Text>
                        <Text style={[styles.friendHandle, { color: palette.textTertiary }]}>{friend.handle}</Text>
                      </View>

                      {friend.status === "IN_ROOM" && (
                        <View style={styles.friendActivityRow}>
                          <View style={[styles.statusDot, { backgroundColor: "#10B981" }]} />
                          <Text style={[styles.friendActivityText, { color: palette.textSecondary }]} numberOfLines={1}>
                            In <Text style={{ fontWeight: "700", color: palette.textPrimary }}>{friend.roomName || "Live Room"}</Text> · {friend.currentTrack || "Listening"}
                          </Text>
                        </View>
                      )}

                      {friend.status === "ONLINE" && (
                        <View style={styles.friendActivityRow}>
                          <View style={[styles.statusDot, { backgroundColor: "#3B82F6" }]} />
                          <Text style={[styles.friendActivityText, { color: palette.textSecondary }]} numberOfLines={1}>
                            {friend.currentTrack ? `Listening to ${friend.currentTrack}` : "Online · Ready to listen"}
                          </Text>
                        </View>
                      )}

                      {friend.status === "OFFLINE" && (
                        <View style={styles.friendActivityRow}>
                          <View style={[styles.statusDot, { backgroundColor: palette.textTertiary }]} />
                          <Text style={[styles.friendActivityTextOffline, { color: palette.textTertiary }]}>Offline</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.friendActions}>
                      {friend.status !== "OFFLINE" && (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={[styles.listenWithBtn, { backgroundColor: palette.accent }]}
                          onPress={() => handleListenWithFriend(friend)}
                        >
                          <Play size={13} color={palette.accentInverted} fill={palette.accentInverted} style={{ marginRight: 4 }} />
                          <Text style={[styles.listenWithBtnText, { color: palette.accentInverted }]}>Listen</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={[styles.chatFriendBtn, { backgroundColor: palette.background, borderColor: palette.border }]}
                        onPress={() => {
                          useChatStore.getState().startConversation(friend);
                          router.push("/(tabs)/messages");
                        }}
                      >
                        <MessageSquare size={14} color={palette.textPrimary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* TAB 3: FRIEND REQUESTS */}
        {activeTab === "REQUESTS" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
                Pending Requests ({pendingRequests.length})
              </Text>
              <Text style={[styles.sectionSub, { color: palette.textTertiary }]}>Accept to share synchronized rooms and spatial voice</Text>
            </View>

            {pendingRequests.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
                <UserCheck size={36} color="#10B981" style={{ marginBottom: 10 }} />
                <Text style={[styles.emptyTitle, { color: palette.textPrimary }]}>You're all caught up!</Text>
                <Text style={[styles.emptySub, { color: palette.textTertiary }]}>No pending friend requests at this time.</Text>
              </View>
            ) : (
              <View style={styles.requestsList}>
                {pendingRequests.map((req) => (
                  <View
                    key={req.id}
                    style={[
                      styles.requestCard,
                      { backgroundColor: palette.surface, borderColor: palette.borderSubtle },
                    ]}
                  >
                    <Image source={{ uri: req.avatar }} style={styles.friendAvatar} />
                    <View style={styles.requestInfo}>
                      <View style={styles.friendNameRow}>
                        <Text style={[styles.friendName, { color: palette.textPrimary }]}>{req.name}</Text>
                        <Text style={[styles.friendHandle, { color: palette.textTertiary }]}>{req.handle}</Text>
                      </View>
                      <Text style={[styles.mutualText, { color: palette.textTertiary }]}>
                        {req.mutualCount} mutual listening friends
                      </Text>
                      {req.message && (
                        <Text style={[styles.requestMessage, { color: palette.textSecondary }]}>"{req.message}"</Text>
                      )}
                    </View>

                    <View style={styles.requestActions}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={[styles.acceptBtn, { backgroundColor: palette.accent }]}
                        onPress={() => handleAcceptRequest(req)}
                      >
                        <Check size={14} color={palette.accentInverted} strokeWidth={2.4} style={{ marginRight: 4 }} />
                        <Text style={[styles.acceptBtnText, { color: palette.accentInverted }]}>Accept</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={[styles.declineBtn, { backgroundColor: palette.background, borderColor: palette.border }]}
                        onPress={() => handleDeclineRequest(req.id)}
                      >
                        <X size={14} color={palette.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Sent Requests Section */}
            {Object.keys(sentRequests).length > 0 && (
              <View style={{ marginTop: spacing.lg }}>
                <Text style={[styles.sectionTitle, { color: palette.textPrimary, fontSize: 13, marginBottom: 8 }]}>
                  Requests You Sent ({Object.values(sentRequests).length})
                </Text>
                <View style={styles.requestsList}>
                  {Object.values(sentRequests).map((req) => (
                    <View
                      key={req.id}
                      style={[
                        styles.requestCard,
                        { backgroundColor: palette.surface, borderColor: palette.borderSubtle },
                      ]}
                    >
                      <Image source={{ uri: req.avatar }} style={styles.friendAvatar} />
                      <View style={styles.requestInfo}>
                        <View style={styles.friendNameRow}>
                          <Text style={[styles.friendName, { color: palette.textPrimary }]}>{req.name}</Text>
                          <Text style={[styles.friendHandle, { color: palette.textTertiary }]}>{req.handle}</Text>
                        </View>
                        <Text style={[styles.mutualText, { color: palette.textTertiary }]}>
                          Sent {req.sentAt} · Awaiting response
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <View style={[styles.pendingSentBadge, { backgroundColor: palette.card, borderColor: palette.speaking }]}>
                          <Check size={11} color={palette.speaking} style={{ marginRight: 4 }} />
                          <Text style={[styles.pendingSentText, { color: palette.speaking }]}>Request Sent</Text>
                        </View>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={[styles.chatFriendBtn, { backgroundColor: palette.background, borderColor: palette.border, marginLeft: 6 }]}
                          onPress={() => {
                            useChatStore.getState().startConversation(req);
                            router.push("/(tabs)/messages");
                          }}
                        >
                          <MessageSquare size={13} color={palette.textPrimary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* TAB 4: FIND & ADD FRIENDS */}
        {activeTab === "FIND" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
                Connect With Friends
              </Text>
              <Text style={[styles.sectionSub, { color: palette.textTertiary }]}>
                Enter any username or handle to add friends and sync audio in real time.
              </Text>
            </View>

            <View style={[styles.searchBar, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              <Search size={16} color={palette.textTertiary} style={{ marginRight: 10 }} />
              <TextInput
                value={searchFriendQuery}
                onChangeText={setSearchFriendQuery}
                placeholder="Type name or handle (e.g. Maya, Dev)..."
                placeholderTextColor={palette.textTertiary}
                style={[styles.searchInput, { color: palette.textPrimary }]}
                onSubmitEditing={() => handleAddDirectFriend(searchFriendQuery)}
              />
              {searchFriendQuery.trim().length > 0 && (
                <TouchableOpacity
                  style={[styles.connectDirectBtn, { backgroundColor: palette.accent }]}
                  onPress={() => handleAddDirectFriend(searchFriendQuery)}
                >
                  <UserPlus size={14} color={palette.accentInverted} style={{ marginRight: 4 }} />
                  <Text style={[styles.connectDirectBtnText, { color: palette.accentInverted }]}>Connect</Text>
                </TouchableOpacity>
              )}
            </View>

            {searchFriendQuery.trim().length === 0 && (
              <View style={[styles.emptyCard, { backgroundColor: palette.surface, borderColor: palette.borderSubtle, marginTop: spacing.md }]}>
                <Sparkles size={28} color={palette.accent} style={{ marginBottom: 8 }} />
                <Text style={[styles.emptyTitle, { color: palette.textPrimary }]}>User-Driven Connections</Text>
                <Text style={[styles.emptySub, { color: palette.textTertiary }]}>
                  Type any friend's name above and click Connect to add them to your persistent circle.
                </Text>
              </View>
            )}
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
              onPress={handleSaveProfile}
            >
              <Text style={[styles.modalSaveText, { color: palette.accentInverted }]}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* LOGIN TO LISTEN / UNIQUE IDENTITY MODAL */}
      <LoginToListenModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
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
  loginToListenCard: {
    padding: spacing.xl,
    borderRadius: radii.xl,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  loginIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  loginCardTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.tight,
    marginBottom: 6,
  },
  loginCardSubtitle: {
    fontSize: typography.sizes.xs,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 380,
    marginBottom: spacing.lg,
  },
  loginCtaBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: radii.full,
    marginBottom: spacing.lg,
  },
  loginCtaBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  featuresPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  featurePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  featurePillText: {
    fontSize: 10,
    fontWeight: "500",
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
    borderRadius: radii.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pendingSentBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  pendingSentText: {
    fontSize: 10,
    fontWeight: "700",
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
    textAlign: "center",
    maxWidth: 360,
  },
  emptyActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 14,
  },
  emptyActionBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
  connectDirectBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  connectDirectBtnText: {
    fontSize: 12,
    fontWeight: "700",
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
