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
import { Search, Users, Plus, Music2, Sparkles } from "lucide-react-native";
import { typography, colors, spacing, radii } from "../../src/theme/tokens";
import { usePlaybackStore } from "../../src/store/playbackStore";
import { CreateRoomModal } from "../../src/components/room/CreateRoomModal";
import { MusicSearchModal } from "../../src/components/music/MusicSearchModal";

export default function HomeScreen() {
  const router = useRouter();
  const palette = colors.light;
  const { currentTrack, playTrackImmediate } = usePlaybackStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const friends = [
    { id: "1", name: "Aisha", track: "Blinding Lights", artist: "The Weeknd", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&q=80" },
    { id: "2", name: "Rahul", track: "Starboy", artist: "The Weeknd", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop&q=80" },
    { id: "3", name: "Priya", track: "Die For You", artist: "The Weeknd", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&fit=crop&q=80" },
  ];

  const rooms = [
    {
      id: "room-late-night-1",
      name: "Late Night Family",
      topic: "Synthwave & Deep Ambient",
      listeners: 4,
      currentTrack: "Blinding Lights",
      artist: "The Weeknd",
      isLive: true,
    },
    {
      id: "room-coding-2",
      name: "Coding With Friends",
      topic: "Lo-Fi Chill & Realtime Presence",
      listeners: 8,
      currentTrack: "Coffee & Rain",
      artist: "Aura",
      isLive: true,
    },
    {
      id: "room-acoustic-3",
      name: "Sunday Acoustic & Coffee",
      topic: "Organic instruments & warm vinyl",
      listeners: 3,
      currentTrack: "Paper Boats on the River",
      artist: "Elena Rostova",
      isLive: true,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Minimal Brand */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: palette.textTertiary }]}>· listen together</Text>
            <Text style={[styles.mainTitle, { color: palette.textPrimary }]}>What are you listening to?</Text>
          </View>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: palette.accent }]}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Minimal Search Bar (Tappable into Catalog Modal) */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.searchBar, { backgroundColor: palette.surface, borderColor: palette.border }]}
          onPress={() => setShowSearchModal(true)}
        >
          <Search size={16} color={palette.textTertiary} style={{ marginRight: 10 }} />
          <Text style={[styles.searchPlaceholder, { color: palette.textTertiary }]}>
            Search tracks, artists, or rooms...
          </Text>
        </TouchableOpacity>

        {/* Friends Listening Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.liveIndicator}>
              <View style={[styles.liveDot, { backgroundColor: palette.speaking }]} />
              <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Friends listening</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.92}
            style={[styles.heroCard, { backgroundColor: palette.card, borderColor: palette.border }]}
            onPress={() => router.push("/room/room-late-night-1")}
          >
            <Image
              source={{ uri: currentTrack?.artworkUrl || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&fit=crop&q=80" }}
              style={styles.heroArtwork}
            />
            <View style={styles.heroInfo}>
              <Text style={[styles.heroTrack, { color: palette.textPrimary }]} numberOfLines={1}>
                {currentTrack?.title || "Blinding Lights"}
              </Text>
              <Text style={[styles.heroArtist, { color: palette.textSecondary }]}>
                {currentTrack?.artist || "The Weeknd"}
              </Text>
              <View style={styles.heroMeta}>
                <View style={[styles.pulseDot, { backgroundColor: palette.speaking }]} />
                <Text style={[styles.heroListeners, { color: palette.textTertiary }]}>4 listening in Late Night Family</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Active Listening Rooms */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Rooms · Live now</Text>
          </View>

          {rooms.map((room) => (
            <TouchableOpacity
              key={room.id}
              activeOpacity={0.85}
              style={[styles.roomCard, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}
              onPress={() => router.push("/room/" + room.id)}
            >
              <View style={styles.roomHeaderRow}>
                <View style={styles.roomTitleGroup}>
                  <Text style={[styles.roomName, { color: palette.textPrimary }]}>{room.name}</Text>
                  <Text style={[styles.roomTopic, { color: palette.textTertiary }]}>{room.topic}</Text>
                </View>
                <View style={[styles.listenerPill, { backgroundColor: palette.background, borderColor: palette.border }]}>
                  <Users size={12} color={palette.textSecondary} style={{ marginRight: 4 }} />
                  <Text style={[styles.listenerCount, { color: palette.textSecondary }]}>{room.listeners}</Text>
                </View>
              </View>

              <View style={styles.roomTrackRow}>
                <Music2 size={13} color={palette.textSecondary} style={{ marginRight: 6 }} />
                <Text style={[styles.roomTrackName, { color: palette.textSecondary }]} numberOfLines={1}>
                  {room.currentTrack} · {room.artist}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* CREATE ROOM MODAL */}
      <CreateRoomModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={(id) => router.push("/room/" + id)}
      />

      {/* MUSIC CATALOG SEARCH MODAL */}
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
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
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
  createButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 46,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  searchPlaceholder: {
    fontSize: typography.sizes.sm,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.tight,
  },
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1,
  },
  heroArtwork: {
    width: 72,
    height: 72,
    borderRadius: radii.md,
  },
  heroInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  heroTrack: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.tight,
  },
  heroArtist: {
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  heroListeners: {
    fontSize: typography.sizes.xs,
  },
  roomCard: {
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  roomHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  roomTitleGroup: {
    flex: 1,
    marginRight: spacing.sm,
  },
  roomName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.tight,
  },
  roomTopic: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
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
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  roomTrackRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  roomTrackName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.regular,
  },
});
