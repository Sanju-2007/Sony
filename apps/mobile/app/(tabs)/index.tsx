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
import { typography, spacing, radii } from "../../src/theme/tokens";
import { usePlaybackStore } from "../../src/store/playbackStore";
import { useThemeStore } from "../../src/store/themeStore";
import { CreateRoomModal } from "../../src/components/room/CreateRoomModal";
import { MusicSearchModal } from "../../src/components/music/MusicSearchModal";
import { DotWaveBackground } from "../../src/components/particles/DotWaveBackground";
import { ThemeToggleButton } from "../../src/components/theme/ThemeToggleButton";

import { useRoomsStore } from "../../src/store/roomsStore";
import { useSocialStore } from "../../src/store/socialStore";

export default function HomeScreen() {
  const router = useRouter();
  const { isDark, palette } = useThemeStore();
  const { currentTrack, playTrackImmediate } = usePlaybackStore();
  const { rooms } = useRoomsStore();
  const { friends } = useSocialStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const featuredRoom = rooms[0];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: palette.background }]}
      edges={["top"]}
    >
      {/* Dynamic Antigravity Dots Wave Background */}
      <DotWaveBackground />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Minimal Brand */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: palette.textTertiary }]}>· LISTEN TOGETHER</Text>
            <Text style={[styles.mainTitle, { color: palette.textPrimary }]}>What are you listening to?</Text>
          </View>

          <View style={styles.headerRightActions}>
            <ThemeToggleButton />
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: palette.accent }]}
              onPress={() => setShowCreateModal(true)}
            >
              <Plus size={18} color={palette.accentInverted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Minimal Glass Search Bar */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.searchBar,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
          ]}
          onPress={() => setShowSearchModal(true)}
        >
          <Search size={16} color={palette.textTertiary} style={{ marginRight: 10 }} />
          <Text style={[styles.searchPlaceholder, { color: palette.textTertiary }]}>
            Search any track, artist, or band worldwide...
          </Text>
        </TouchableOpacity>

        {/* Live Featured Party Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.liveIndicator}>
              <View style={[styles.liveDot, { backgroundColor: palette.speaking }]} />
              <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Live Featured Party</Text>
            </View>
          </View>

          {featuredRoom ? (
            <TouchableOpacity
              activeOpacity={0.92}
              style={[
                styles.heroCard,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                },
              ]}
              onPress={() => router.push("/room/" + featuredRoom.id)}
            >
              <Image
                source={{ uri: featuredRoom.currentTrack?.artworkUrl || currentTrack?.artworkUrl || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&fit=crop&q=80" }}
                style={styles.heroArtwork}
              />
              <View style={styles.heroInfo}>
                <View style={styles.heroBadgeRow}>
                  <View style={styles.livePill}>
                    <View style={[styles.pulseDot, { backgroundColor: palette.speaking }]} />
                    <Text style={styles.livePillText}>
                      LIVE NOW · {featuredRoom.participantCount || 1} SYNCED
                    </Text>
                  </View>
                </View>
                <Text style={[styles.heroTrack, { color: palette.textPrimary }]} numberOfLines={1}>
                  {featuredRoom.currentTrack?.title || currentTrack?.title || "No track playing"}
                </Text>
                <Text style={[styles.heroArtist, { color: palette.textSecondary }]}>
                  {featuredRoom.currentTrack?.artist || currentTrack?.artist || "Host stage"} · {featuredRoom.name}
                </Text>
              </View>
              <View style={[styles.joinBtn, { backgroundColor: palette.accent }]}>
                <Text style={[styles.joinBtnText, { color: palette.accentInverted }]}>Join Stage</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View
              style={[
                styles.heroEmptyCard,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                },
              ]}
            >
              <View style={styles.emptyHeroBadge}>
                <Sparkles size={16} color={palette.accent} style={{ marginRight: 6 }} />
                <Text style={[styles.emptyHeroBadgeText, { color: palette.accent }]}>REAL-TIME AUDIO SYNC</Text>
              </View>
              <Text style={[styles.emptyHeroTitle, { color: palette.textPrimary }]}>
                Start your first listening room
              </Text>
              <Text style={[styles.emptyHeroDesc, { color: palette.textSecondary }]}>
                Listen synchronously with sub-10ms drift, talk over music with automatic voice ducking, and invite friends.
              </Text>
              <View style={styles.emptyHeroActionRow}>
                <TouchableOpacity
                  style={[styles.emptyHeroBtnPrimary, { backgroundColor: palette.accent }]}
                  onPress={() => setShowCreateModal(true)}
                >
                  <Plus size={16} color={palette.accentInverted} style={{ marginRight: 6 }} />
                  <Text style={[styles.emptyHeroBtnText, { color: palette.accentInverted }]}>Create Room</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.emptyHeroBtnSecondary,
                    { backgroundColor: palette.card, borderColor: palette.border },
                  ]}
                  onPress={() => setShowSearchModal(true)}
                >
                  <Search size={15} color={palette.textPrimary} style={{ marginRight: 6 }} />
                  <Text style={[styles.emptyHeroBtnSecText, { color: palette.textPrimary }]}>Search Songs</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Active Listening Rooms */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Rooms · Live now</Text>
          </View>

          {rooms.length === 0 ? (
            <View style={[styles.emptyRoomsCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
              <Sparkles size={24} color={palette.accent} style={{ marginBottom: 8 }} />
              <Text style={[styles.emptyRoomsTitle, { color: palette.textPrimary }]}>No active rooms yet</Text>
              <Text style={[styles.emptyRoomsSubtitle, { color: palette.textTertiary }]}>
                Rooms you create will appear here. Start a stage with any genre, lo-fi beats, or acoustic tracks.
              </Text>
              <TouchableOpacity
                style={[styles.emptyRoomsActionBtn, { backgroundColor: palette.accent }]}
                onPress={() => setShowCreateModal(true)}
              >
                <Plus size={15} color={palette.accentInverted} style={{ marginRight: 6 }} />
                <Text style={[styles.emptyRoomsActionBtnText, { color: palette.accentInverted }]}>Create Room</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.roomsGrid}>
              {rooms.map((room) => {
                const trackTitle = room.currentTrack?.title || "No track playing";
                const trackArtist = room.currentTrack?.artist || "Tap to select music";
                return (
                  <TouchableOpacity
                    key={room.id}
                    activeOpacity={0.85}
                    style={[
                      styles.roomCard,
                      {
                        backgroundColor: palette.card,
                        borderColor: palette.border,
                      },
                    ]}
                    onPress={() => router.push("/room/" + room.id)}
                  >
                    <View style={styles.roomHeaderRow}>
                      <View style={styles.roomTitleGroup}>
                        <Text style={[styles.roomName, { color: palette.textPrimary }]}>{room.name}</Text>
                        <Text style={[styles.roomTopic, { color: palette.textTertiary }]}>
                          {room.description || "Live Room"}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.listenerPill,
                          {
                            backgroundColor: isDark ? "rgba(129, 140, 248, 0.12)" : "rgba(99, 102, 241, 0.12)",
                            borderColor: isDark ? "rgba(129, 140, 248, 0.25)" : "rgba(99, 102, 241, 0.25)",
                          },
                        ]}
                      >
                        <Users size={12} color="#818CF8" style={{ marginRight: 4 }} />
                        <Text style={[styles.listenerCount, { color: "#818CF8" }]}>
                          {room.participantCount || 1}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.roomTrackRow}>
                      <Music2 size={13} color={palette.textTertiary} style={{ marginRight: 6 }} />
                      <Text style={[styles.roomTrackName, { color: palette.textSecondary }]} numberOfLines={1}>
                        {trackTitle} · {trackArtist}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
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
          if (rooms.length > 0) {
            router.push("/room/" + rooms[0].id);
          } else {
            setShowCreateModal(true);
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  createButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
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
    marginBottom: spacing.xl,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
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
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
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
  },
  heroArtist: {
    fontSize: 13,
    marginTop: 2,
  },
  joinBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    marginLeft: 12,
  },
  joinBtnText: {
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
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
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
  },
  roomTopic: {
    fontSize: 12,
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
    fontSize: 12,
    fontWeight: "600",
  },
  roomTrackRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
  },
  roomTrackName: {
    fontSize: 12,
    fontWeight: "500",
  },
  heroEmptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: "flex-start",
  },
  emptyHeroBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  emptyHeroBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  emptyHeroTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  emptyHeroDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.md,
    maxWidth: 500,
  },
  emptyHeroActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  emptyHeroBtnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyHeroBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyHeroBtnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  emptyHeroBtnSecText: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyRoomsCard: {
    padding: spacing.xl,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  emptyRoomsTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptyRoomsSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    maxWidth: 360,
    marginBottom: spacing.md,
  },
  emptyRoomsActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: 10,
  },
  emptyRoomsActionBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
