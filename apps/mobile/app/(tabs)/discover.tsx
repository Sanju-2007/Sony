import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Sparkles,
  Flame,
  Radio,
  Compass,
  Search,
  Plus,
  Users,
  Music2,
  Bell,
  X,
  SlidersHorizontal,
} from "lucide-react-native";
import { typography, spacing, radii } from "../../src/theme/tokens";
import { CreateRoomModal } from "../../src/components/room/CreateRoomModal";
import { MusicSearchModal } from "../../src/components/music/MusicSearchModal";
import { NotificationCenterModal } from "../../src/components/notifications/NotificationCenterModal";
import { usePlaybackStore } from "../../src/store/playbackStore";
import { useThemeStore } from "../../src/store/themeStore";
import { useRoomsStore } from "../../src/store/roomsStore";
import { useNotificationStore } from "../../src/store/notificationStore";
import { useModerationStore } from "../../src/store/moderationStore";
import { ThemeToggleButton } from "../../src/components/theme/ThemeToggleButton";

export default function DiscoverScreen() {
  const router = useRouter();
  const { palette, isDark } = useThemeStore();
  const { playTrackImmediate } = usePlaybackStore();
  const { rooms } = useRoomsStore();
  const { getUnreadCount } = useNotificationStore();
  const { isUserBlocked } = useModerationStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  const unreadNotifCount = getUnreadCount();

  const genreChips = [
    { label: "All Vibes", value: "all" },
    { label: "Ambient Chill", value: "chill" },
    { label: "Deep Focus", value: "focus" },
    { label: "Electronic", value: "electronic" },
    { label: "Acoustic", value: "acoustic" },
    { label: "Hip-Hop", value: "hiphop" },
  ];

  const categories = [
    {
      title: "Ambient & Chill",
      count: "Curated ambient vibes",
      tag: "chill",
      artwork:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&fit=crop&q=80",
    },
    {
      title: "Deep Focus & Code",
      count: "Lo-Fi chill beats",
      tag: "focus",
      artwork:
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&fit=crop&q=80",
    },
    {
      title: "Electronic / Synthwave",
      count: "Retro synths & dance",
      tag: "electronic",
      artwork:
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&fit=crop&q=80",
    },
    {
      title: "Acoustic & Warm Vinyl",
      count: "Organic instruments",
      tag: "acoustic",
      artwork:
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&fit=crop&q=80",
    },
  ];

  // Live filter rooms by query and genre tag
  const filteredRooms = rooms.filter((room) => {
    // Hide rooms hosted by blocked users
    if (room.ownerId && isUserBlocked(room.ownerId)) return false;

    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      room.name.toLowerCase().includes(q) ||
      (room.description && room.description.toLowerCase().includes(q)) ||
      (room.currentTrack &&
        (room.currentTrack.title.toLowerCase().includes(q) ||
          room.currentTrack.artist.toLowerCase().includes(q)));

    const matchesTag =
      selectedTag === "all" ||
      (room.description &&
        room.description.toLowerCase().includes(selectedTag)) ||
      room.name.toLowerCase().includes(selectedTag);

    return matchesQuery && matchesTag;
  });

  const handleCategoryPress = (tag: string) => {
    setSelectedTag(tag);
    const existing = rooms.find(
      (r) =>
        (r.description && r.description.toLowerCase().includes(tag)) ||
        r.name.toLowerCase().includes(tag)
    );
    if (existing) {
      router.push("/room/" + existing.id);
    } else {
      setShowCreateModal(true);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: palette.background }]}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: palette.textTertiary }]}>
              · explore
            </Text>
            <Text style={[styles.mainTitle, { color: palette.textPrimary }]}>
              Discover Rooms
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[
                styles.iconBtn,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.borderSubtle,
                },
              ]}
              onPress={() => setShowNotificationModal(true)}
              accessibilityLabel="Notifications"
            >
              <Bell size={16} color={palette.textPrimary} />
              {unreadNotifCount > 0 && (
                <View
                  style={[
                    styles.notifBadge,
                    { backgroundColor: palette.speaking },
                  ]}
                >
                  <Text style={styles.notifBadgeText}>
                    {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <ThemeToggleButton />

            <TouchableOpacity
              style={[styles.createBtn, { backgroundColor: palette.accent }]}
              onPress={() => setShowCreateModal(true)}
            >
              <Plus
                size={16}
                color={palette.accentInverted}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.createBtnText,
                  { color: palette.accentInverted },
                ]}
              >
                New Room
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Live Search & Filter Bar */}
        <View
          style={[
            styles.searchBarContainer,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
          ]}
        >
          <Search
            size={16}
            color={palette.textTertiary}
            style={{ marginRight: 8 }}
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search rooms, tracks, artists, or vibes..."
            placeholderTextColor={palette.textTertiary}
            style={[styles.searchInput, { color: palette.textPrimary }]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={15} color={palette.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Genre Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {genreChips.map((chip) => {
            const isSelected = selectedTag === chip.value;
            return (
              <TouchableOpacity
                key={chip.value}
                onPress={() => setSelectedTag(chip.value)}
                style={[
                  styles.genreChip,
                  {
                    backgroundColor: isSelected
                      ? palette.accent
                      : palette.surface,
                    borderColor: isSelected
                      ? palette.accent
                      : palette.borderSubtle,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: isSelected
                        ? palette.accentInverted
                        : palette.textSecondary,
                      fontWeight: isSelected ? "600" : "400",
                    },
                  ]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Live Stages Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Flame
              size={16}
              color={palette.speaking}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[styles.sectionTitle, { color: palette.textPrimary }]}
            >
              Live Stages ({filteredRooms.length})
            </Text>
          </View>

          {filteredRooms.length === 0 ? (
            <View
              style={[
                styles.emptyDiscoverCard,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                },
              ]}
            >
              <Sparkles
                size={24}
                color={palette.accent}
                style={{ marginBottom: 8 }}
              />
              <Text
                style={[
                  styles.emptyDiscoverTitle,
                  { color: palette.textPrimary },
                ]}
              >
                {searchQuery || selectedTag !== "all"
                  ? "No matching rooms found"
                  : "No live stages currently"}
              </Text>
              <Text
                style={[
                  styles.emptyDiscoverSubtitle,
                  { color: palette.textSecondary },
                ]}
              >
                {searchQuery || selectedTag !== "all"
                  ? "Try adjusting your search query or host a new stage with this vibe."
                  : "Be the first to host! Create a room, queue tracks, and invite listeners to join your stage."}
              </Text>
              <TouchableOpacity
                style={[
                  styles.emptyDiscoverBtn,
                  { backgroundColor: palette.accent },
                ]}
                onPress={() => setShowCreateModal(true)}
              >
                <Plus
                  size={15}
                  color={palette.accentInverted}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.emptyDiscoverBtnText,
                    { color: palette.accentInverted },
                  ]}
                >
                  Host a Room
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.trendingList}>
              {filteredRooms.map((room) => {
                const trackTitle =
                  room.currentTrack?.title || "No track queued";
                const trackArtist =
                  room.currentTrack?.artist || "Tap to select music";
                const artworkUrl =
                  room.currentTrack?.artworkUrl ||
                  "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&fit=crop&q=80";

                return (
                  <TouchableOpacity
                    key={room.id}
                    style={[
                      styles.trendingCard,
                      {
                        backgroundColor: palette.surface,
                        borderColor: palette.borderSubtle,
                      },
                    ]}
                    onPress={() => router.push("/room/" + room.id)}
                  >
                    <Image
                      source={{ uri: artworkUrl }}
                      style={styles.trendingThumb}
                    />
                    <View style={styles.trendingInfo}>
                      <Text
                        style={[
                          styles.trendingName,
                          { color: palette.textPrimary },
                        ]}
                      >
                        {room.name}
                      </Text>
                      <Text
                        style={[
                          styles.trendingTopic,
                          { color: palette.textTertiary },
                        ]}
                        numberOfLines={1}
                      >
                        {room.description || "Active Listening Stage"}
                      </Text>
                      <View style={styles.trendingTrackRow}>
                        <Music2
                          size={11}
                          color={palette.textSecondary}
                          style={{ marginRight: 4 }}
                        />
                        <Text
                          style={[
                            styles.trendingTrack,
                            { color: palette.textSecondary },
                          ]}
                          numberOfLines={1}
                        >
                          {trackTitle} · {trackArtist}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.listenerPill,
                        {
                          backgroundColor: palette.background,
                          borderColor: palette.border,
                        },
                      ]}
                    >
                      <Users
                        size={11}
                        color={palette.textSecondary}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={[
                          styles.listenerCount,
                          { color: palette.textSecondary },
                        ]}
                      >
                        {room.participantCount || 1}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Curated Soundscapes Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Sparkles
              size={16}
              color={palette.textPrimary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[styles.sectionTitle, { color: palette.textPrimary }]}
            >
              Curated Soundscapes
            </Text>
          </View>

          <View style={styles.categoriesGrid}>
            {categories.map((c, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.88}
                style={[
                  styles.categoryTile,
                  {
                    backgroundColor: palette.surface,
                    borderColor: palette.borderSubtle,
                  },
                ]}
                onPress={() => handleCategoryPress(c.tag)}
              >
                <Image
                  source={{ uri: c.artwork }}
                  style={styles.categoryTileArtwork}
                />
                <View style={styles.categoryTileOverlay} />
                <View style={styles.categoryTileTextContainer}>
                  <Text style={styles.categoryTileTitle}>{c.title}</Text>
                  <Text style={styles.categoryTileCount}>{c.count}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* CREATE ROOM MODAL */}
      <CreateRoomModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={(id) => router.push("/room/" + id)}
      />

      {/* MUSIC SEARCH MODAL */}
      <MusicSearchModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelectTrack={(track) => {
          playTrackImmediate(track);
          if (rooms.length > 0) {
            router.push("/room/" + rooms[0].id);
          } else {
            setShowCreateModal(true);
          }
        }}
      />

      {/* NOTIFICATION CENTER MODAL */}
      <NotificationCenterModal
        visible={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 100,
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
  },
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
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notifBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  notifBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },
  eyebrow: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  mainTitle: {
    fontSize: typography.sizes["2xl"],
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.tight,
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
  },
  createBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.xs,
    height: "100%",
  },
  chipsContainer: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 6,
    marginBottom: spacing.md,
  },
  genreChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: typography.sizes.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.tight,
  },
  emptyDiscoverCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyDiscoverTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    marginBottom: 4,
  },
  emptyDiscoverSubtitle: {
    fontSize: typography.sizes.xs,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: spacing.md,
    maxWidth: 380,
  },
  emptyDiscoverBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radii.full,
  },
  emptyDiscoverBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  trendingList: {
    gap: 10,
  },
  trendingCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  trendingThumb: {
    width: 50,
    height: 50,
    borderRadius: radii.sm,
    marginRight: spacing.md,
  },
  trendingInfo: {
    flex: 1,
  },
  trendingName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginBottom: 2,
  },
  trendingTopic: {
    fontSize: typography.sizes.xs,
    marginBottom: 4,
  },
  trendingTrackRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  trendingTrack: {
    fontSize: typography.sizes.xs,
  },
  listenerPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
    marginLeft: spacing.sm,
  },
  listenerCount: {
    fontSize: 10,
    fontWeight: "700",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  categoryTile: {
    width: "48%",
    height: 110,
    borderRadius: radii.lg,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
  },
  categoryTileArtwork: {
    ...StyleSheet.absoluteFillObject,
  },
  categoryTileOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  categoryTileTextContainer: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
  },
  categoryTileTitle: {
    color: "#FFFFFF",
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  categoryTileCount: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 10,
    marginTop: 2,
  },
});
