import React, { useState, useMemo, useEffect, useRef } from "react";
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
  ActivityIndicator,
} from "react-native";
import { Search, X, Play, Plus, Check, Music2, Globe, Sparkles } from "lucide-react-native";
import { TrackMetadata } from "@sony/types";
import { typography, colors, spacing, radii } from "../../theme/tokens";
import { useThemeStore } from "../../store/themeStore";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const CATALOG_TRACKS: TrackMetadata[] = [
  {
    id: "track-blinding-05",
    provider: "SPOTIFY",
    providerTrackId: "spotify-blinding-lights",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    artworkUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&fit=crop&q=80",
    durationMs: 200000,
    streamUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c7a73cbd.mp3?filename=electronic-future-beats-117997.mp3",
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
    streamUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=chill-abstract-intention-12099.mp3",
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
    id: "track-chill-07",
    provider: "LICENSED_CATALOG",
    providerTrackId: "track-chill-07",
    title: "Nordic Frost & Fireplace",
    artist: "Soren Lindqvist",
    album: "Fjord Sessions",
    artworkUrl: "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=600&fit=crop&q=80",
    durationMs: 215000,
    streamUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
  },
  {
    id: "track-asitwas-08",
    provider: "SPOTIFY",
    providerTrackId: "spotify-as-it-was",
    title: "As It Was",
    artist: "Harry Styles",
    album: "Harry's House",
    artworkUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&fit=crop&q=80",
    durationMs: 167000,
    streamUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c7a73cbd.mp3?filename=electronic-future-beats-117997.mp3",
  },
  {
    id: "track-antihero-09",
    provider: "SPOTIFY",
    providerTrackId: "spotify-anti-hero",
    title: "Anti-Hero",
    artist: "Taylor Swift",
    album: "Midnights",
    artworkUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&fit=crop&q=80",
    durationMs: 200000,
    streamUrl: "https://cdn.pixabay.com/download/audio/2021/11/25/audio_9422df5f48.mp3?filename=acoustic-guitars-ambient-10657.mp3",
  },
  {
    id: "track-levitating-10",
    provider: "SPOTIFY",
    providerTrackId: "spotify-levitating",
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    artworkUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&fit=crop&q=80",
    durationMs: 203000,
    streamUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c7a73cbd.mp3?filename=electronic-future-beats-117997.mp3",
  },
  {
    id: "track-yellow-11",
    provider: "SPOTIFY",
    providerTrackId: "spotify-yellow",
    title: "Yellow",
    artist: "Coldplay",
    album: "Parachutes",
    artworkUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&fit=crop&q=80",
    durationMs: 269000,
    streamUrl: "https://cdn.pixabay.com/download/audio/2021/11/25/audio_9422df5f48.mp3?filename=acoustic-guitars-ambient-10657.mp3",
  },
  {
    id: "track-getlucky-12",
    provider: "SPOTIFY",
    providerTrackId: "spotify-get-lucky",
    title: "Get Lucky",
    artist: "Daft Punk ft. Pharrell Williams",
    album: "Random Access Memories",
    artworkUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&fit=crop&q=80",
    durationMs: 248000,
    streamUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=chill-abstract-intention-12099.mp3",
  },
  {
    id: "track-badguy-13",
    provider: "SPOTIFY",
    providerTrackId: "spotify-bad-guy",
    title: "bad guy",
    artist: "Billie Eilish",
    album: "WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?",
    artworkUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&fit=crop&q=80",
    durationMs: 194000,
    streamUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c7a73cbd.mp3?filename=electronic-future-beats-117997.mp3",
  },
  {
    id: "track-kesariya-14",
    provider: "LICENSED_CATALOG",
    providerTrackId: "track-kesariya",
    title: "Kesariya",
    artist: "Arijit Singh, Pritam",
    album: "Brahmāstra",
    artworkUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&fit=crop&q=80",
    durationMs: 268000,
    streamUrl: "https://cdn.pixabay.com/download/audio/2021/11/25/audio_9422df5f48.mp3?filename=acoustic-guitars-ambient-10657.mp3",
  },
  {
    id: "track-dynamite-15",
    provider: "SPOTIFY",
    providerTrackId: "spotify-dynamite",
    title: "Dynamite",
    artist: "BTS",
    album: "BE",
    artworkUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&fit=crop&q=80",
    durationMs: 199000,
    streamUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c7a73cbd.mp3?filename=electronic-future-beats-117997.mp3",
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
  const { palette, isDark } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [addedTrackIds, setAddedTrackIds] = useState<Record<string, boolean>>({});

  // Live iTunes search state
  const [liveResults, setLiveResults] = useState<TrackMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimerRef = useRef<any>(null);

  const genres = ["All", "Pop", "Electronic", "Ambient", "Lo-Fi", "Acoustic"];

  // Debounced iTunes Search Query
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setLiveResults([]);
      setIsLoading(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
          q
        )}&entity=song&limit=30`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();

        if (data.results && Array.isArray(data.results)) {
          const mapped: TrackMetadata[] = data.results.map((item: any) => ({
            id: `itunes-${item.trackId}`,
            provider: "APPLE_MUSIC",
            providerTrackId: String(item.trackId),
            title: item.trackName || "Untitled Track",
            artist: item.artistName || "Unknown Artist",
            album: item.collectionName || item.trackName || "Single",
            artworkUrl: item.artworkUrl100
              ? item.artworkUrl100.replace("100x100bb", "600x600bb")
              : "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&fit=crop&q=80",
            durationMs: item.trackTimeMillis || 180000,
            streamUrl: item.previewUrl,
          }));
          setLiveResults(mapped);
        }
      } catch (err) {
        console.warn("iTunes search query failed, using local filter:", err);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // Combined tracks: live results take priority if query is present
  const displayTracks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (q && liveResults.length > 0) {
      return liveResults;
    }

    return CATALOG_TRACKS.filter((t) => {
      const matchesText =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q);

      if (!matchesText) return false;

      if (selectedGenre === "All") return true;
      if (selectedGenre === "Ambient")
        return t.title.includes("Ambient") || t.album.includes("Presence");
      if (selectedGenre === "Lo-Fi")
        return t.title.includes("Rain") || t.title.includes("Frost");
      if (selectedGenre === "Electronic")
        return t.title.includes("Solar") || t.artist.includes("Aura") || t.artist.includes("Daft");
      if (selectedGenre === "Acoustic")
        return t.title.includes("Paper") || t.title.includes("Boats") || t.artist.includes("Arijit");
      if (selectedGenre === "Pop")
        return t.provider === "SPOTIFY";
      return true;
    });
  }, [searchQuery, liveResults, selectedGenre]);

  const handleQueueTrack = (track: TrackMetadata) => {
    if (onAddToQueue) {
      onAddToQueue(track);
    }
    setAddedTrackIds((prev) => ({ ...prev, [track.id]: true }));
    setTimeout(() => {
      setAddedTrackIds((prev) => ({ ...prev, [track.id]: false }));
    }, 2500);
  };

  const handlePlayNow = (track: TrackMetadata) => {
    if (onSelectTrack) {
      onSelectTrack(track);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: palette.surface }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <View style={styles.badgeRow}>
                <Globe size={13} color="#059669" style={{ marginRight: 5 }} />
                <Text style={styles.badgeText}>GLOBAL MUSIC SEARCH (MILLIONS OF SONGS)</Text>
              </View>
              <Text style={[styles.modalTitle, { color: palette.textPrimary }]}>Search & Queue Songs</Text>
            </View>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: palette.background, borderColor: palette.border }]}
              onPress={onClose}
            >
              <X size={18} color={palette.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Search Box */}
          <View style={[styles.searchBox, { backgroundColor: palette.background, borderColor: palette.border }]}>
            <Search size={18} color={palette.textTertiary} style={{ marginRight: 10 }} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search any artist, song, or album (e.g. Taylor Swift, Drake, Coldplay)..."
              placeholderTextColor={palette.textTertiary}
              style={[styles.searchInput, { color: palette.textPrimary }]}
              autoFocus
            />
            {isLoading ? (
              <ActivityIndicator size="small" color={palette.textPrimary} />
            ) : searchQuery.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={16} color={palette.textTertiary} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Genre Filters (when not actively searching live) */}
          {!searchQuery.trim() && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.genreRow}
            >
              {genres.map((genre) => {
                const isSelected = selectedGenre === genre;
                return (
                  <TouchableOpacity
                    key={genre}
                    style={[
                      styles.genrePill,
                      {
                        backgroundColor: isSelected ? palette.accent : palette.background,
                        borderColor: isSelected ? palette.accent : palette.border,
                      },
                    ]}
                    onPress={() => setSelectedGenre(genre)}
                  >
                    <Text
                      style={[
                        styles.genreText,
                        { color: isSelected ? palette.accentInverted : palette.textSecondary },
                      ]}
                    >
                      {genre}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Track Results List */}
          <ScrollView contentContainerStyle={styles.tracksList} showsVerticalScrollIndicator={false}>
            {displayTracks.length === 0 && !isLoading ? (
              <View style={styles.emptyContainer}>
                <Music2 size={36} color={palette.textTertiary} style={{ marginBottom: 12 }} />
                <Text style={[styles.emptyTitle, { color: palette.textPrimary }]}>No tracks found</Text>
                <Text style={[styles.emptySubtitle, { color: palette.textTertiary }]}>
                  Try searching for another song, artist, or band name.
                </Text>
              </View>
            ) : (
              displayTracks.map((track) => {
                const isAdded = !!addedTrackIds[track.id];
                return (
                  <View
                    key={track.id}
                    style={[
                      styles.trackCard,
                      { backgroundColor: palette.surface, borderColor: palette.borderSubtle },
                    ]}
                  >
                    <Image
                      source={{
                        uri:
                          track.artworkUrl ||
                          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&fit=crop&q=80",
                      }}
                      style={styles.trackArtwork}
                    />
                    <View style={styles.trackInfo}>
                      <Text style={[styles.trackTitle, { color: palette.textPrimary }]} numberOfLines={1}>
                        {track.title}
                      </Text>
                      <Text style={[styles.trackArtist, { color: palette.textSecondary }]} numberOfLines={1}>
                        {track.artist} · {track.album}
                      </Text>
                      <View style={styles.trackMeta}>
                        <Text
                          style={[
                            styles.metaBadge,
                            { backgroundColor: palette.background, color: palette.textTertiary },
                          ]}
                        >
                          {track.provider === "APPLE_MUSIC"
                            ? "Hi-Res Preview"
                            : track.provider === "SPOTIFY"
                            ? "Spotify Master"
                            : "Licensed Studio"}
                        </Text>
                      </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.trackActions}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={[styles.playBtn, { backgroundColor: palette.accent }]}
                        onPress={() => handlePlayNow(track)}
                      >
                        <Play size={14} color={palette.accentInverted} fill={palette.accentInverted} />
                        <Text style={[styles.playBtnText, { color: palette.accentInverted }]}>Play</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={[
                          styles.queueBtn,
                          {
                            backgroundColor: isAdded ? "rgba(16, 185, 129, 0.12)" : palette.background,
                            borderColor: isAdded ? "#10B981" : palette.border,
                          },
                        ]}
                        onPress={() => handleQueueTrack(track)}
                      >
                        {isAdded ? (
                          <Check size={14} color="#10B981" />
                        ) : (
                          <Plus size={14} color={palette.textPrimary} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    height: SCREEN_HEIGHT * 0.88,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: "#059669",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
    color: "#0A0A0A",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    height: 48,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#0A0A0A",
    // @ts-ignore
    outlineStyle: "none",
  },
  genreRow: {
    flexDirection: "row",
    paddingBottom: spacing.sm,
    gap: 8,
  },
  genrePill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  genreText: {
    fontSize: 12,
    fontWeight: "600",
  },
  tracksList: {
    paddingTop: spacing.sm,
    paddingBottom: 40,
  },
  trackCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
  },
  trackArtwork: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: "#F4F4F5",
  },
  trackInfo: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0A0A0A",
  },
  trackArtist: {
    fontSize: 12,
    color: "#52525B",
    marginTop: 2,
  },
  trackMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  metaBadge: {
    fontSize: 10,
    fontWeight: "600",
    color: "#71717A",
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trackActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  playBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 5,
  },
  playBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  queueBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0A0A0A",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#71717A",
    marginTop: 4,
    textAlign: "center",
    maxWidth: 280,
  },
});
