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
import { Search, X, Play, Plus, Check, Music2, Globe, Sparkles, RotateCcw } from "lucide-react-native";
import { TrackMetadata } from "@sony/types";
import { typography, colors, spacing, radii } from "../../theme/tokens";
import { useThemeStore } from "../../store/themeStore";
import {
  freeMusicService,
  FEATURED_FULL_AUDIO_TRACKS,
} from "../../services/freeMusicService";
import {
  youtubeMusicService,
  CURATED_YOUTUBE_TRACKS,
} from "../../services/youtubeMusicService";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const CATALOG_TRACKS: TrackMetadata[] = [
  ...FEATURED_FULL_AUDIO_TRACKS,
  ...CURATED_YOUTUBE_TRACKS,
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
  const [addedTrackIds, setAddedTrackIds] = useState<Record<string, boolean>>({});

  // Dynamic recommendations & last played track persistence
  const [lastPlayedTrack, setLastPlayedTrack] = useState<TrackMetadata | null>(() => {
    return freeMusicService.getLastPlayedTrack();
  });
  const [recommendations, setRecommendations] = useState<TrackMetadata[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState<boolean>(false);

  // Live YouTube audio search state
  const [liveResults, setLiveResults] = useState<TrackMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimerRef = useRef<any>(null);

  // Sync lastPlayedTrack & load dynamic recommendations when modal opens
  useEffect(() => {
    if (visible) {
      const stored = freeMusicService.getLastPlayedTrack();
      setLastPlayedTrack(stored);
      if (stored) {
        setIsLoadingRecs(true);
        freeMusicService
          .getRecommendations(stored.artist, stored.title)
          .then((recs) => {
            setRecommendations(recs || []);
          })
          .catch((err) => {
            console.warn("Failed to load recommendations:", err);
          })
          .finally(() => {
            setIsLoadingRecs(false);
          });
      } else {
        setRecommendations([]);
      }
    }
  }, [visible]);

  // Debounced search query
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
        // 1. Search YouTube for full video audio (zero ads/video frames)
        const audioResults = await freeMusicService.searchTracks(q);
        if (audioResults && audioResults.length > 0) {
          setLiveResults(audioResults);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Full YouTube audio search error:", err);
      }

      // 2. Secondary fallback to direct YouTube
      try {
        const ytResults = await youtubeMusicService.searchTracks(q);
        if (ytResults && ytResults.length > 0) {
          setLiveResults(ytResults);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Direct YouTube search fallback error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  // Display tracks rule:
  // 1. If actively searching: show live YouTube results
  // 2. If NOT searching:
  //    - If user has played a song previously: recommend based on that song!
  //    - If first search (no last played song): REMOVE ALL SUGGESTIONS (return empty list)
  const displayTracks = useMemo(() => {
    if (isSearching) {
      return liveResults;
    }
    if (lastPlayedTrack) {
      return recommendations;
    }
    return [];
  }, [isSearching, liveResults, lastPlayedTrack, recommendations]);

  const handleQueueTrack = (track: TrackMetadata) => {
    freeMusicService.setLastPlayedTrack(track);
    setLastPlayedTrack(track);
    if (onAddToQueue) {
      onAddToQueue(track);
    }
    setAddedTrackIds((prev) => ({ ...prev, [track.id]: true }));
    setTimeout(() => {
      setAddedTrackIds((prev) => ({ ...prev, [track.id]: false }));
    }, 2500);
  };

  const handlePlayNow = (track: TrackMetadata) => {
    freeMusicService.setLastPlayedTrack(track);
    setLastPlayedTrack(track);
    if (onSelectTrack) {
      onSelectTrack(track);
      onClose();
    }
  };

  const handleResetHistory = () => {
    freeMusicService.setLastPlayedTrack(null);
    setLastPlayedTrack(null);
    setRecommendations([]);
  };

  const formatDuration = (ms: number) => {
    const totalSec = Math.floor((ms || 180000) / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: palette.surface }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <View style={styles.badgeRow}>
                <Music2 size={13} color="#10B981" style={{ marginRight: 5 }} />
                <Text style={[styles.badgeText, { color: "#10B981" }]}>
                  YOUTUBE AUDIO ENGINE · PURE SOUND
                </Text>
              </View>
              <Text style={[styles.modalTitle, { color: palette.textPrimary }]}>Search YouTube Audio</Text>
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
              placeholder="Search any song, artist, or band (e.g. Taylor Swift, Coldplay)..."
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

          {/* Recommendation Banner (when not searching and lastPlayedTrack exists) */}
          {!isSearching && lastPlayedTrack && (
            <View style={[styles.recBanner, { backgroundColor: palette.background, borderColor: palette.borderSubtle }]}>
              <View style={styles.recBannerLeft}>
                <View style={styles.recBadgeRow}>
                  <Sparkles size={13} color="#10B981" style={{ marginRight: 5 }} />
                  <Text style={[styles.recBadgeText, { color: "#10B981" }]}>RECOMMENDED FOR YOU</Text>
                </View>
                <Text style={[styles.recBannerTitle, { color: palette.textPrimary }]} numberOfLines={1}>
                  Based on "{lastPlayedTrack.title}" by {lastPlayedTrack.artist}
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.recResetBtn, { borderColor: palette.borderSubtle }]}
                onPress={handleResetHistory}
              >
                <RotateCcw size={11} color={palette.textTertiary} style={{ marginRight: 4 }} />
                <Text style={[styles.recResetText, { color: palette.textTertiary }]}>Reset</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Track Results / Empty States / Recommendations List */}
          <ScrollView contentContainerStyle={styles.tracksList} showsVerticalScrollIndicator={false}>
            {/* Case 1: First Search (No search query & no last played song) -> REMOVE ALL SUGGESTIONS */}
            {!isSearching && !lastPlayedTrack ? (
              <View style={styles.firstSearchContainer}>
                <View style={[styles.firstSearchIconCircle, { backgroundColor: palette.background, borderColor: palette.border }]}>
                  <Search size={32} color={palette.accent} />
                </View>
                <Text style={[styles.firstSearchTitle, { color: palette.textPrimary }]}>
                  Search Any YouTube Song
                </Text>
                <Text style={[styles.firstSearchSubtitle, { color: palette.textSecondary }]}>
                  Type any song, artist, or band to stream full audio with zero ads or video frames.
                </Text>
                <View style={[styles.firstSearchTipBox, { backgroundColor: palette.background, borderColor: palette.borderSubtle }]}>
                  <Sparkles size={15} color="#10B981" style={{ marginRight: 8 }} />
                  <Text style={[styles.firstSearchTipText, { color: palette.textTertiary }]}>
                    Initial suggestions removed for your first search. Once you play a track, we'll recommend similar music here next time!
                  </Text>
                </View>
              </View>
            ) : !isSearching && isLoadingRecs ? (
              /* Case 2: Loading recommendations */
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={palette.accent} style={{ marginBottom: 10 }} />
                <Text style={[styles.loadingText, { color: palette.textSecondary }]}>
                  Curating recommendations based on {lastPlayedTrack?.artist || "recent song"}...
                </Text>
              </View>
            ) : isSearching && isLoading ? (
              /* Case 3: Searching live */
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={palette.accent} style={{ marginBottom: 10 }} />
                <Text style={[styles.loadingText, { color: palette.textSecondary }]}>
                  Searching YouTube Audio...
                </Text>
              </View>
            ) : displayTracks.length === 0 ? (
              /* Case 4: No results found */
              <View style={styles.emptyContainer}>
                <Music2 size={36} color={palette.textTertiary} style={{ marginBottom: 12 }} />
                <Text style={[styles.emptyTitle, { color: palette.textPrimary }]}>No tracks found</Text>
                <Text style={[styles.emptySubtitle, { color: palette.textTertiary }]}>
                  Try searching for another song, artist, or band name.
                </Text>
              </View>
            ) : (
              /* Case 5: Track List */
              displayTracks.map((track) => {
                const isAdded = !!addedTrackIds[track.id];
                const isRec = !isSearching && !!lastPlayedTrack;
                const durationStr = formatDuration(track.durationMs);

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
                            {
                              backgroundColor: isRec
                                ? "rgba(16, 185, 129, 0.12)"
                                : "rgba(239, 68, 68, 0.10)",
                              color: isRec ? "#10B981" : "#EF4444",
                              fontWeight: "700",
                            },
                          ]}
                        >
                          {isRec ? `✨ Recommended · ${durationStr}` : `YouTube Audio · ${durationStr}`}
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
  recBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  recBannerLeft: {
    flex: 1,
    marginRight: 10,
  },
  recBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  recBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  recBannerTitle: {
    fontSize: 12,
    fontWeight: "600",
  },
  recResetBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  recResetText: {
    fontSize: 11,
    fontWeight: "600",
  },
  tracksList: {
    paddingTop: spacing.xs,
    paddingBottom: 40,
  },
  firstSearchContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: spacing.md,
  },
  firstSearchIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: 16,
  },
  firstSearchTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.2,
    marginBottom: 8,
    textAlign: "center",
  },
  firstSearchSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    maxWidth: 320,
    marginBottom: 20,
  },
  firstSearchTipBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    maxWidth: 340,
  },
  firstSearchTipText: {
    fontSize: 11,
    fontWeight: "500",
    flex: 1,
    lineHeight: 16,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 45,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: "500",
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
