import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
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
} from "lucide-react-native";
import { typography, spacing, radii } from "../../src/theme/tokens";
import { CreateRoomModal } from "../../src/components/room/CreateRoomModal";
import { MusicSearchModal } from "../../src/components/music/MusicSearchModal";
import { usePlaybackStore } from "../../src/store/playbackStore";
import { useThemeStore } from "../../src/store/themeStore";
import { ThemeToggleButton } from "../../src/components/theme/ThemeToggleButton";

export default function DiscoverScreen() {
  const router = useRouter();
  const { palette, isDark } = useThemeStore();
  const { playTrackImmediate } = usePlaybackStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const categories = [
    { title: "Ambient & Chill", count: "14 rooms", tag: "chill", artwork: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&fit=crop&q=80" },
    { title: "Deep Focus & Code", count: "9 rooms", tag: "focus", artwork: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&fit=crop&q=80" },
    { title: "Electronic / Synthwave", count: "22 rooms", tag: "electronic", artwork: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&fit=crop&q=80" },
    { title: "Acoustic & Warm Vinyl", count: "6 rooms", tag: "acoustic", artwork: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&fit=crop&q=80" },
  ];

  const trendingRooms = [
    {
      id: "room-late-night-1",
      name: "Late Night Family",
      topic: "Synthwave & Deep Ambient",
      listeners: 4,
      track: "Blinding Lights",
      artist: "The Weeknd",
      artwork: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&fit=crop&q=80",
    },
    {
      id: "room-coding-2",
      name: "Coding With Friends",
      topic: "Lo-Fi Chill & Realtime Presence",
      listeners: 8,
      track: "Coffee & Rain",
      artist: "Aura",
      artwork: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=200&fit=crop&q=80",
    },
    {
      id: "room-acoustic-3",
      name: "Sunday Acoustic & Coffee",
      topic: "Organic instruments & warm vinyl",
      listeners: 3,
      track: "Paper Boats on the River",
      artist: "Elena Rostova",
      artwork: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&fit=crop&q=80",
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: palette.textTertiary }]}>· explore</Text>
            <Text style={[styles.mainTitle, { color: palette.textPrimary }]}>Discover Rooms</Text>
          </View>
          <View style={styles.headerActions}>
            <ThemeToggleButton />
            <TouchableOpacity
              style={[styles.createBtn, { backgroundColor: palette.accent }]}
              onPress={() => setShowCreateModal(true)}
            >
              <Plus size={16} color={palette.accentInverted} style={{ marginRight: 4 }} />
              <Text style={[styles.createBtnText, { color: palette.accentInverted }]}>New Room</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.searchBox, { backgroundColor: palette.surface, borderColor: palette.border }]}
          onPress={() => setShowSearchModal(true)}
        >
          <Search size={16} color={palette.textTertiary} style={{ marginRight: 10 }} />
          <Text style={[styles.searchPlaceholder, { color: palette.textTertiary }]}>
            Search music library or curated genres...
          </Text>
        </TouchableOpacity>

        {/* Trending Live Rooms Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Flame size={16} color={palette.speaking} style={{ marginRight: 6 }} />
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Trending Rooms</Text>
          </View>

          <View style={styles.trendingList}>
            {trendingRooms.map((room) => (
              <TouchableOpacity
                key={room.id}
                style={[
                  styles.trendingCard,
                  { backgroundColor: palette.surface, borderColor: palette.borderSubtle },
                ]}
                onPress={() => router.push("/room/" + room.id)}
              >
                <Image source={{ uri: room.artwork }} style={styles.trendingThumb} />
                <View style={styles.trendingInfo}>
                  <Text style={[styles.trendingName, { color: palette.textPrimary }]}>{room.name}</Text>
                  <Text style={[styles.trendingTopic, { color: palette.textTertiary }]} numberOfLines={1}>
                    {room.topic}
                  </Text>
                  <View style={styles.trendingTrackRow}>
                    <Music2 size={11} color={palette.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={[styles.trendingTrack, { color: palette.textSecondary }]} numberOfLines={1}>
                      {room.track} · {room.artist}
                    </Text>
                  </View>
                </View>
                <View style={[styles.listenerPill, { backgroundColor: palette.background, borderColor: palette.border }]}>
                  <Users size={11} color={palette.textSecondary} style={{ marginRight: 4 }} />
                  <Text style={[styles.listenerCount, { color: palette.textSecondary }]}>{room.listeners}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Curated Vibes Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Sparkles size={16} color={palette.textPrimary} style={{ marginRight: 6 }} />
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Curated Soundscapes</Text>
          </View>

          <View style={styles.categoriesGrid}>
            {categories.map((c, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.88}
                style={[
                  styles.categoryTile,
                  { backgroundColor: palette.surface, borderColor: palette.borderSubtle },
                ]}
                onPress={() => router.push("/room/room-late-night-1")}
              >
                <Image source={{ uri: c.artwork }} style={styles.categoryTileArtwork} />
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
          router.push("/room/room-late-night-1");
        }}
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
  eyebrow: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  mainTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.tight,
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6366F1",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
  },
  createBtnText: {
    color: "#FFFFFF",
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  searchPlaceholder: {
    fontSize: typography.sizes.sm,
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
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  trendingList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  trendingCard: {
    flex: 1,
    minWidth: 300,
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
  },
  trendingThumb: {
    width: 52,
    height: 52,
    borderRadius: radii.sm,
  },
  trendingInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  trendingName: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  trendingTopic: {
    fontSize: 12,
    marginTop: 2,
  },
  trendingTrackRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  trendingTrack: {
    fontSize: 12,
  },
  listenerPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  listenerCount: {
    fontSize: 12,
    fontWeight: "600",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  categoryTile: {
    flex: 1,
    minWidth: 260,
    height: 120,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
    justifyContent: "flex-end",
    padding: spacing.md,
    borderWidth: 1,
  },
  categoryTileArtwork: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  categoryTileOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  categoryTileTextContainer: {
    zIndex: 2,
  },
  categoryTileTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  categoryTileCount: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 11,
    marginTop: 2,
  },
});
