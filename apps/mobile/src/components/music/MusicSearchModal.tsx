import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { Search, X, Play, Plus, Check, Music2 } from "lucide-react-native";
import { TrackMetadata } from "@sony/types";
import { typography, colors, spacing, radii } from "../../theme/tokens";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const CATALOG_TRACKS: TrackMetadata[] = [
  {
    id: "track-ambient-01",
    provider: "LICENSED_CATALOG",
    providerTrackId: "track-ambient-01",
    title: "Midnight Ambient Waves",
    artist: "Sony Sound Collective",
    album: "Presence Vol. 1",
    artworkUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&fit=crop&q=80",
    durationMs: 240000,
    streamUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
  },
  {
    id: "track-lofi-02",
    provider: "LICENSED_CATALOG",
    providerTrackId: "track-lofi-02",
    title: "Tokyo Rain & Neon Lights",
    artist: "Kaito & Maya",
    album: "Shibuya Midnight",
    artworkUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&fit=crop&q=80",
    durationMs: 195000,
    streamUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=chill-abstract-intention-12099.mp3",
  },
  {
    id: "track-synth-03",
    provider: "LICENSED_CATALOG",
    providerTrackId: "track-synth-03",
    title: "Solar Flare Horizon",
    artist: "Aura Electric",
    album: "Neon Genesis",
    artworkUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&fit=crop&q=80",
    durationMs: 210000,
    streamUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c7a73cbd.mp3?filename=electronic-future-beats-117997.mp3",
  },
  {
    id: "track-acoustic-04",
    provider: "LICENSED_CATALOG",
    providerTrackId: "track-acoustic-04",
    title: "Paper Boats on the River",
    artist: "Elena Rostova",
    album: "Quiet Hours",
    artworkUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&fit=crop&q=80",
    durationMs: 180000,
    streamUrl: "https://cdn.pixabay.com/download/audio/2021/11/25/audio_9422df5f48.mp3?filename=acoustic-guitars-ambient-10657.mp3",
  },
  {
    id: "track-blinding-05",
    provider: "SPOTIFY",
    providerTrackId: "spotify-blinding-lights",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    artworkUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&fit=crop&q=80",
    durationMs: 200000,
    isrc: "USUM71922301",
  },
  {
    id: "track-starboy-06",
    provider: "SPOTIFY",
    providerTrackId: "spotify-starboy",
    title: "Starboy",
    artist: "The Weeknd ft. Daft Punk",
    album: "Starboy",
    artworkUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&fit=crop&q=80",
    durationMs: 230000,
  },
  {
    id: "track-chill-07",
    provider: "LICENSED_CATALOG",
    providerTrackId: "track-chill-07",
    title: "Nordic Frost & Fireplace",
    artist: "Soren Lindqvist",
    album: "Fjord Sessions",
    artworkUrl: "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=600&fit=crop&q=80",
    durationMs: 215000,
  },
];

interface MusicSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTrack?: (track: TrackMetadata) => void;
  onAddToQueue?: (track: TrackMetadata) => void;
}

export function MusicSearchModal({
  visible,
  onClose,
  onSelectTrack,
  onAddToQueue,
}: MusicSearchModalProps) {
  const palette = colors.light;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [addedTrackIds, setAddedTrackIds] = useState<Record<string, boolean>>({});

  const genres = ["All", "Ambient", "Lo-Fi", "Synthwave", "Acoustic", "Pop"];

  const filteredTracks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return CATALOG_TRACKS.filter((t) => {
      const matchesText =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q);

      if (!matchesText) return false;

      if (selectedGenre === "All") return true;
      if (selectedGenre === "Ambient") return t.title.includes("Ambient") || t.album.includes("Presence");
      if (selectedGenre === "Lo-Fi") return t.title.includes("Rain") || t.title.includes("Frost");
      if (selectedGenre === "Synthwave") return t.title.includes("Solar") || t.artist.includes("Aura");
      if (selectedGenre === "Acoustic") return t.title.includes("Paper") || t.title.includes("Boats");
      if (selectedGenre === "Pop") return t.provider === "SPOTIFY";
      return true;
    });
  }, [searchQuery, selectedGenre]);

  const handleQueueTrack = (track: TrackMetadata) => {
    if (onAddToQueue) {
      onAddToQueue(track);
      setAddedTrackIds((prev) => ({ ...prev, [track.id]: true }));
      setTimeout(() => {
        setAddedTrackIds((prev) => ({ ...prev, [track.id]: false }));
      }, 1800);
    }
  };

  const formatDuration = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheetContainer, { backgroundColor: palette.background }]}>
          {/* Top Bar / Drag handle */}
          <View style={styles.sheetHeader}>
            <View style={[styles.handleBar, { backgroundColor: palette.border }]} />
            <View style={styles.titleRow}>
              <View style={styles.titleWithIcon}>
                <Music2 size={18} color={palette.textPrimary} style={{ marginRight: 6 }} />
                <Text style={[styles.sheetTitle, { color: palette.textPrimary }]}>Music Catalog</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <X size={20} color={palette.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Box */}
          <View style={[styles.searchBox, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <Search size={16} color={palette.textTertiary} style={{ marginRight: 8 }} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search tracks, artists, moods..."
              placeholderTextColor={palette.textTertiary}
              style={[styles.searchInput, { color: palette.textPrimary }]}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={16} color={palette.textTertiary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Genre Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.genrePillsRow}
          >
            {genres.map((g) => {
              const isActive = selectedGenre === g;
              return (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.genrePill,
                    {
                      backgroundColor: isActive ? palette.textPrimary : palette.surface,
                      borderColor: isActive ? palette.textPrimary : palette.borderSubtle,
                    },
                  ]}
                  onPress={() => setSelectedGenre(g)}
                >
                  <Text
                    style={[
                      styles.genreText,
                      { color: isActive ? "#FFFFFF" : palette.textSecondary },
                    ]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Track Results List */}
          <ScrollView contentContainerStyle={styles.resultsList} showsVerticalScrollIndicator={false}>
            <Text style={[styles.resultsHeader, { color: palette.textTertiary }]}>
              {filteredTracks.length} TRACKS AVAILABLE
            </Text>

            {filteredTracks.map((track) => {
              const isAdded = !!addedTrackIds[track.id];
              return (
                <View
                  key={track.id}
                  style={[
                    styles.trackCard,
                    { backgroundColor: palette.surface, borderColor: palette.borderSubtle },
                  ]}
                >
                  <Image source={{ uri: track.artworkUrl }} style={styles.artwork} />
                  <View style={styles.trackDetails}>
                    <Text style={[styles.trackTitle, { color: palette.textPrimary }]} numberOfLines={1}>
                      {track.title}
                    </Text>
                    <Text style={[styles.trackArtist, { color: palette.textSecondary }]} numberOfLines={1}>
                      {track.artist} · {formatDuration(track.durationMs)}
                    </Text>
                    <View style={styles.badgeRow}>
                      <View
                        style={[
                          styles.providerBadge,
                          {
                            backgroundColor:
                              track.provider === "LICENSED_CATALOG"
                                ? "rgba(16, 185, 129, 0.12)"
                                : "rgba(29, 185, 84, 0.12)",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            {
                              color:
                                track.provider === "LICENSED_CATALOG" ? palette.speaking : "#1DB954",
                            },
                          ]}
                        >
                          {track.provider === "LICENSED_CATALOG" ? "✓ Sync Ready" : "Spotify"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.actionButtons}>
                    {onSelectTrack && (
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: palette.surface, borderColor: palette.border }]}
                        onPress={() => {
                          onSelectTrack(track);
                          onClose();
                        }}
                      >
                        <Play size={14} color={palette.textPrimary} />
                      </TouchableOpacity>
                    )}

                    {onAddToQueue && (
                      <TouchableOpacity
                        style={[
                          styles.actionBtn,
                          {
                            backgroundColor: isAdded ? palette.speaking : palette.textPrimary,
                            borderColor: isAdded ? palette.speaking : palette.textPrimary,
                          },
                        ]}
                        onPress={() => handleQueueTrack(track)}
                      >
                        {isAdded ? (
                          <Check size={14} color="#FFFFFF" />
                        ) : (
                          <Plus size={14} color="#FFFFFF" />
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    height: SCREEN_HEIGHT * 0.85,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: 30,
  },
  sheetHeader: {
    alignItems: "center",
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  titleWithIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  sheetTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.tight,
  },
  closeBtn: {
    padding: 6,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.sm,
  },
  genrePillsRow: {
    flexDirection: "row",
    paddingVertical: spacing.sm,
    gap: 8,
  },
  genrePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  genreText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  resultsList: {
    paddingBottom: 20,
    gap: 10,
  },
  resultsHeader: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.wider,
    marginTop: spacing.xs,
    marginBottom: 4,
  },
  trackCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
  },
  trackDetails: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: "center",
  },
  trackTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  trackArtist: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  providerBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: typography.weights.semibold,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: spacing.sm,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
});
