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
import { DotWaveBackground } from "../../src/components/particles/DotWaveBackground";

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
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Dynamic Antigravity Black Dots Wave Background */}
      <DotWaveBackground />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Minimal Brand */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>· LISTEN TOGETHER</Text>
            <Text style={styles.mainTitle}>What are you listening to?</Text>
          </View>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Minimal Glass Search Bar */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.searchBar}
          onPress={() => setShowSearchModal(true)}
        >
          <Search size={16} color="#71717A" style={{ marginRight: 10 }} />
          <Text style={styles.searchPlaceholder}>
            Search tracks, artists, or rooms...
          </Text>
        </TouchableOpacity>

        {/* Friends Listening Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.liveIndicator}>
              <View style={[styles.liveDot, { backgroundColor: palette.speaking }]} />
              <Text style={styles.sectionTitle}>Live Featured Party</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.92}
            style={styles.heroCard}
            onPress={() => router.push("/room/room-late-night-1")}
          >
            <Image
              source={{ uri: currentTrack?.artworkUrl || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&fit=crop&q=80" }}
              style={styles.heroArtwork}
            />
            <View style={styles.heroInfo}>
              <View style={styles.heroBadgeRow}>
                <View style={styles.livePill}>
                  <View style={[styles.pulseDot, { backgroundColor: palette.speaking }]} />
                  <Text style={styles.livePillText}>LIVE NOW · 4 SYNCED</Text>
                </View>
              </View>
              <Text style={styles.heroTrack} numberOfLines={1}>
                {currentTrack?.title || "Blinding Lights"}
              </Text>
              <Text style={styles.heroArtist}>
                {currentTrack?.artist || "The Weeknd"} · Late Night Family
              </Text>
            </View>
            <View style={styles.joinBtn}>
              <Text style={styles.joinBtnText}>Join Stage</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Active Listening Rooms */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Rooms · Live now</Text>
          </View>

          <View style={styles.roomsGrid}>
            {rooms.map((room) => (
              <TouchableOpacity
                key={room.id}
                activeOpacity={0.85}
                style={[styles.roomCard, { backgroundColor: palette.card, borderColor: palette.border }]}
                onPress={() => router.push("/room/" + room.id)}
              >
                <View style={styles.roomHeaderRow}>
                  <View style={styles.roomTitleGroup}>
                    <Text style={[styles.roomName, { color: palette.textPrimary }]}>{room.name}</Text>
                    <Text style={[styles.roomTopic, { color: palette.textTertiary }]}>{room.topic}</Text>
                  </View>
                  <View style={[styles.listenerPill, { backgroundColor: "rgba(99, 102, 241, 0.12)", borderColor: "rgba(99, 102, 241, 0.25)" }]}>
                    <Users size={12} color="#818CF8" style={{ marginRight: 4 }} />
                    <Text style={[styles.listenerCount, { color: "#818CF8" }]}>{room.listeners}</Text>
                  </View>
                </View>

                <View style={styles.roomTrackRow}>
                  <Music2 size={13} color="#94A3B8" style={{ marginRight: 6 }} />
                  <Text style={[styles.roomTrackName, { color: "#94A3B8" }] } numberOfLines={1}>
                    {room.currentTrack} · {room.artist}
                  </Text>
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
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 100,
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
    zIndex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 4,
    color: "#71717A",
    textTransform: "uppercase",
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
    color: "#0A0A0A",
  },
  createButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#0A0A0A",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    marginBottom: spacing.xl,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  searchPlaceholder: {
    fontSize: typography.sizes.sm,
    color: "#8E8E93",
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
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
    color: "#0A0A0A",
  },
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    backgroundColor: "rgba(255, 255, 255, 0.82)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
  },
  heroArtwork: {
    width: 76,
    height: 76,
    borderRadius: 12,
  },
  heroInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  heroBadgeRow: {
    marginBottom: 4,
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  livePillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#10B981",
    letterSpacing: 0.5,
  },
  heroTrack: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
    color: "#0A0A0A",
  },
  heroArtist: {
    fontSize: 13,
    color: "#52525B",
    marginTop: 2,
  },
  joinBtn: {
    backgroundColor: "#0A0A0A",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    marginLeft: 12,
  },
  joinBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  roomsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  roomCard: {
    flex: 1,
    minWidth: 280,
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    backgroundColor: "rgba(255, 255, 255, 0.82)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
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
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
    color: "#0A0A0A",
  },
  roomTopic: {
    fontSize: 12,
    color: "#71717A",
    marginTop: 2,
  },
  listenerPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
  listenerCount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0A0A0A",
  },
  roomTrackRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
  },
  roomTrackName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#52525B",
  },
});
