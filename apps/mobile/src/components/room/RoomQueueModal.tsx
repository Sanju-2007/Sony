import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import {
  X,
  Play,
  Pause,
  Trash2,
  ThumbsUp,
  Plus,
  Music,
  ListMusic,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Radio,
  Clock,
} from "lucide-react-native";
import { usePlaybackStore, ExtendedQueueItem } from "../../store/playbackStore";
import { useThemeStore } from "../../store/themeStore";
import { useAuthStore } from "../../store/authStore";
import { typography, spacing, radii } from "../../theme/tokens";
import { TrackMetadata } from "@sony/types";

interface RoomQueueModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
  roomId?: string;
}

const STARTER_PACKS: { name: string; icon: string; tracks: TrackMetadata[] }[] = [
  {
    name: "Synthwave Sunset",
    icon: "⚡",
    tracks: [
      {
        id: "pack-synth-1",
        provider: "LICENSED_CATALOG",
        providerTrackId: "pack-synth-1",
        title: "Neon Horizon & Fast Drives",
        artist: "Tokyo Synth Syndicate",
        album: "Outrun 1984",
        artworkUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&fit=crop&q=80",
        durationMs: 220000,
        streamUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c7a73cbd.mp3?filename=electronic-future-beats-117997.mp3",
      },
      {
        id: "pack-synth-2",
        provider: "LICENSED_CATALOG",
        providerTrackId: "pack-synth-2",
        title: "Midnight City Lights",
        artist: "Synthwave Sunset",
        album: "Cyber Dreams",
        artworkUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&fit=crop&q=80",
        durationMs: 210000,
        streamUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c7a73cbd.mp3?filename=electronic-future-beats-117997.mp3",
      },
      {
        id: "pack-synth-3",
        provider: "LICENSED_CATALOG",
        providerTrackId: "pack-synth-3",
        title: "As It Was (Retro Lounge)",
        artist: "Harry Styles",
        album: "Harry's House",
        artworkUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&fit=crop&q=80",
        durationMs: 167000,
        streamUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c7a73cbd.mp3?filename=electronic-future-beats-117997.mp3",
      },
    ],
  },
  {
    name: "Lo-Fi Study Beats",
    icon: "☕",
    tracks: [
      {
        id: "pack-lofi-1",
        provider: "LICENSED_CATALOG",
        providerTrackId: "pack-lofi-1",
        title: "Midnight Ambient Waves",
        artist: "Sony Sound Collective",
        album: "Presence Vol. 1",
        artworkUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&fit=crop&q=80",
        durationMs: 240000,
        streamUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
      },
      {
        id: "pack-lofi-2",
        provider: "LICENSED_CATALOG",
        providerTrackId: "pack-lofi-2",
        title: "Nordic Frost & Warm Tea",
        artist: "Soren Lindqvist",
        album: "Fjord Sessions",
        artworkUrl: "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=600&fit=crop&q=80",
        durationMs: 215000,
        streamUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
      },
      {
        id: "pack-lofi-3",
        provider: "LICENSED_CATALOG",
        providerTrackId: "pack-lofi-3",
        title: "Paper Boats on the River",
        artist: "Elena Rostova",
        album: "Quiet Hours",
        artworkUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&fit=crop&q=80",
        durationMs: 180000,
        streamUrl: "https://cdn.pixabay.com/download/audio/2021/11/25/audio_9422df5f48.mp3?filename=acoustic-guitars-ambient-10657.mp3",
      },
    ],
  },
];

export function RoomQueueModal({
  visible,
  onClose,
  onOpenSearch,
  roomId = "room-1",
}: RoomQueueModalProps) {
  const { isDark, palette } = useThemeStore();
  const { user } = useAuthStore();
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    queue,
    removeFromQueue,
    upvoteQueueItem,
    playQueueItem,
    clearQueue,
    moveQueueItem,
    addTracksToQueue,
    positionMs,
    durationMs,
  } = usePlaybackStore();

  const currentUserPublic = user
    ? { id: user.id, username: user.username, displayName: user.displayName || user.username }
    : { id: "guest-user", username: "guest", displayName: "Guest" };

  const formatDuration = (ms: number) => {
    const totalSec = Math.floor((ms || 0) / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleAddStarterPack = (tracks: TrackMetadata[]) => {
    addTracksToQueue(tracks, currentUserPublic);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: palette.background, borderColor: palette.border },
          ]}
        >
          {/* Header */}
          <View style={[styles.headerRow, { borderBottomColor: palette.borderSubtle }]}>
            <View style={styles.headerTitleWrap}>
              <View style={[styles.headerIconCircle, { backgroundColor: palette.surface }]}>
                <ListMusic size={18} color={palette.speaking} />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: palette.textPrimary }]}>
                  Room Queue
                </Text>
                <Text style={[styles.headerSubtitle, { color: palette.textSecondary }]}>
                  {queue.length} upcoming track{queue.length === 1 ? "" : "s"} · Live Synchronized
                </Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              {queue.length > 0 && (
                <TouchableOpacity
                  style={[styles.clearBtn, { borderColor: palette.borderSubtle }]}
                  onPress={clearQueue}
                  activeOpacity={0.8}
                >
                  <Trash2 size={12} color={palette.textTertiary} style={{ marginRight: 4 }} />
                  <Text style={[styles.clearBtnText, { color: palette.textTertiary }]}>Clear</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.closeBtn, { backgroundColor: palette.surface }]}
                onPress={onClose}
              >
                <X size={18} color={palette.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. NOW PLAYING CARD */}
            {currentTrack && (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeaderRow}>
                  <View style={[styles.liveDot, { backgroundColor: "#10B981" }]} />
                  <Text style={[styles.sectionLabel, { color: palette.speaking }]}>
                    NOW PLAYING ON STAGE
                  </Text>
                </View>

                <View
                  style={[
                    styles.nowPlayingCard,
                    {
                      backgroundColor: palette.surface,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <Image
                    source={{
                      uri:
                        currentTrack.artworkUrl ||
                        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&fit=crop&q=80",
                    }}
                    style={styles.nowPlayingThumb}
                  />

                  <View style={styles.nowPlayingDetails}>
                    <Text style={[styles.nowPlayingTitle, { color: palette.textPrimary }]} numberOfLines={1}>
                      {currentTrack.title}
                    </Text>
                    <Text style={[styles.nowPlayingArtist, { color: palette.textSecondary }]} numberOfLines={1}>
                      {currentTrack.artist}
                    </Text>
                    <View style={styles.nowPlayingMetaRow}>
                      <Clock size={11} color={palette.textTertiary} style={{ marginRight: 4 }} />
                      <Text style={[styles.nowPlayingTimeText, { color: palette.textTertiary }]}>
                        {formatDuration(positionMs)} / {formatDuration(durationMs || currentTrack.durationMs)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.nowPlayingRightActions}>
                    {/* Animated Equalizer */}
                    <View style={styles.equalizerIndicator}>
                      <View style={[styles.eqBar, { height: isPlaying ? 16 : 6, backgroundColor: palette.speaking }]} />
                      <View style={[styles.eqBar, { height: isPlaying ? 22 : 10, backgroundColor: palette.speaking }]} />
                      <View style={[styles.eqBar, { height: isPlaying ? 14 : 4, backgroundColor: palette.speaking }]} />
                      <View style={[styles.eqBar, { height: isPlaying ? 18 : 8, backgroundColor: palette.speaking }]} />
                    </View>

                    <TouchableOpacity
                      style={[styles.playToggleBtn, { backgroundColor: palette.accent }]}
                      onPress={togglePlay}
                      activeOpacity={0.8}
                    >
                      {isPlaying ? (
                        <Pause size={14} color={palette.accentInverted} />
                      ) : (
                        <Play size={14} color={palette.accentInverted} style={{ marginLeft: 2 }} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* 2. UPCOMING QUEUE LIST */}
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeaderRow}>
                <ListMusic size={14} color={palette.textSecondary} style={{ marginRight: 6 }} />
                <Text style={[styles.sectionLabel, { color: palette.textSecondary }]}>
                  UP NEXT ({queue.length})
                </Text>
                <TouchableOpacity
                  style={[styles.quickAddBtn, { backgroundColor: palette.surface, borderColor: palette.border }]}
                  onPress={() => {
                    onClose();
                    onOpenSearch();
                  }}
                >
                  <Plus size={12} color={palette.textPrimary} style={{ marginRight: 4 }} />
                  <Text style={[styles.quickAddBtnText, { color: palette.textPrimary }]}>Add Track</Text>
                </TouchableOpacity>
              </View>

              {queue.length === 0 ? (
                /* EMPTY QUEUE CARD */
                <View
                  style={[
                    styles.emptyContainer,
                    {
                      backgroundColor: palette.surface,
                      borderColor: palette.borderSubtle,
                    },
                  ]}
                >
                  <View style={[styles.emptyIconCircle, { backgroundColor: palette.background }]}>
                    <Music size={26} color={palette.textTertiary} />
                  </View>
                  <Text style={[styles.emptyTitle, { color: palette.textPrimary }]}>
                    Queue is currently empty
                  </Text>
                  <Text style={[styles.emptyDesc, { color: palette.textSecondary }]}>
                    Add songs so the music keeps flowing smoothly for everyone in the room!
                  </Text>

                  {/* Primary Add Action */}
                  <TouchableOpacity
                    style={[styles.primaryAddBtn, { backgroundColor: palette.accent }]}
                    onPress={() => {
                      onClose();
                      onOpenSearch();
                    }}
                    activeOpacity={0.85}
                  >
                    <Plus size={16} color={palette.accentInverted} style={{ marginRight: 6 }} />
                    <Text style={[styles.primaryAddBtnText, { color: palette.accentInverted }]}>
                      Search & Add Songs
                    </Text>
                  </TouchableOpacity>

                  {/* Starter Packs */}
                  <View style={styles.starterPacksSection}>
                    <Text style={[styles.starterPacksTitle, { color: palette.textTertiary }]}>
                      ⚡ OR QUICK-FILL WITH CURATED PACKS:
                    </Text>
                    <View style={styles.starterPackRow}>
                      {STARTER_PACKS.map((pack) => (
                        <TouchableOpacity
                          key={pack.name}
                          style={[
                            styles.starterPackChip,
                            { backgroundColor: palette.background, borderColor: palette.border },
                          ]}
                          onPress={() => handleAddStarterPack(pack.tracks)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.starterPackEmoji}>{pack.icon}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.starterPackName, { color: palette.textPrimary }]}>
                              {pack.name}
                            </Text>
                            <Text style={[styles.starterPackCount, { color: palette.textTertiary }]}>
                              +3 tracks
                            </Text>
                          </View>
                          <Plus size={14} color={palette.speaking} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              ) : (
                /* POPULATED QUEUE */
                <View style={styles.queueList}>
                  {queue.map((item: ExtendedQueueItem, index: number) => (
                    <View
                      key={item.id}
                      style={[
                        styles.queueItemCard,
                        {
                          backgroundColor: palette.surface,
                          borderColor: palette.borderSubtle,
                        },
                      ]}
                    >
                      {/* Reorder Arrows & Position */}
                      <View style={styles.reorderColumn}>
                        <TouchableOpacity
                          disabled={index === 0}
                          style={[styles.arrowBtn, index === 0 && { opacity: 0.2 }]}
                          onPress={() => moveQueueItem(item.id, "up")}
                        >
                          <ChevronUp size={14} color={palette.textSecondary} />
                        </TouchableOpacity>
                        <Text style={[styles.positionText, { color: palette.textTertiary }]}>
                          #{index + 1}
                        </Text>
                        <TouchableOpacity
                          disabled={index === queue.length - 1}
                          style={[styles.arrowBtn, index === queue.length - 1 && { opacity: 0.2 }]}
                          onPress={() => moveQueueItem(item.id, "down")}
                        >
                          <ChevronDown size={14} color={palette.textSecondary} />
                        </TouchableOpacity>
                      </View>

                      {/* Track Artwork */}
                      <Image
                        source={{
                          uri:
                            item.track.artworkUrl ||
                            "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&fit=crop&q=80",
                        }}
                        style={styles.queueItemThumb}
                      />

                      {/* Track Info */}
                      <View style={styles.queueItemDetails}>
                        <Text
                          style={[styles.queueItemTitle, { color: palette.textPrimary }]}
                          numberOfLines={1}
                        >
                          {item.track.title}
                        </Text>
                        <Text
                          style={[styles.queueItemArtist, { color: palette.textSecondary }]}
                          numberOfLines={1}
                        >
                          {item.track.artist} · {formatDuration(item.track.durationMs)}
                        </Text>
                        <View style={styles.addedByRow}>
                          <Text style={[styles.addedByText, { color: palette.textTertiary }]}>
                            added by{" "}
                            <Text style={{ color: palette.textSecondary, fontWeight: "600" }}>
                              {item.addedBy?.displayName || item.addedBy?.username || "Listener"}
                            </Text>
                          </Text>
                        </View>
                      </View>

                      {/* Action Buttons */}
                      <View style={styles.queueItemActions}>
                        {/* Upvote */}
                        <TouchableOpacity
                          style={[
                            styles.upvoteBtn,
                            {
                              backgroundColor: item.hasUpvoted ? palette.speaking : "transparent",
                              borderColor: item.hasUpvoted ? palette.speaking : palette.border,
                            },
                          ]}
                          onPress={() => upvoteQueueItem(item.id)}
                          activeOpacity={0.8}
                        >
                          <ThumbsUp
                            size={11}
                            color={item.hasUpvoted ? "#FFFFFF" : palette.textSecondary}
                            style={{ marginRight: 3 }}
                          />
                          <Text
                            style={[
                              styles.upvoteText,
                              { color: item.hasUpvoted ? "#FFFFFF" : palette.textSecondary },
                            ]}
                          >
                            {item.upvotes}
                          </Text>
                        </TouchableOpacity>

                        {/* Play Immediately */}
                        <TouchableOpacity
                          style={[styles.actionIconBtn, { borderColor: palette.border }]}
                          onPress={() => playQueueItem(item.id)}
                          activeOpacity={0.8}
                        >
                          <Play size={12} color={palette.textPrimary} />
                        </TouchableOpacity>

                        {/* Remove */}
                        <TouchableOpacity
                          style={[styles.actionIconBtn, { borderColor: palette.border }]}
                          onPress={() => removeFromQueue(item.id)}
                          activeOpacity={0.8}
                        >
                          <Trash2 size={12} color={palette.textTertiary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Bottom Fixed Action Bar */}
          <View style={[styles.footerRow, { borderTopColor: palette.borderSubtle }]}>
            <TouchableOpacity
              style={[styles.footerAddBtn, { backgroundColor: palette.accent }]}
              onPress={() => {
                onClose();
                onOpenSearch();
              }}
              activeOpacity={0.85}
            >
              <Plus size={16} color={palette.accentInverted} style={{ marginRight: 6 }} />
              <Text style={[styles.footerAddBtnText, { color: palette.accentInverted }]}>
                Add More Songs
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.footerCloseBtn, { borderColor: palette.border }]}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={[styles.footerCloseBtnText, { color: palette.textPrimary }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalContainer: {
    width: "100%",
    maxWidth: 720,
    maxHeight: "90%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  headerSubtitle: {
    fontSize: typography.sizes.xs,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  clearBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sectionWrap: {
    marginBottom: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    flex: 1,
  },
  quickAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  quickAddBtnText: {
    fontSize: 11,
    fontWeight: "600",
  },
  nowPlayingCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  nowPlayingThumb: {
    width: 50,
    height: 50,
    borderRadius: radii.md,
  },
  nowPlayingDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  nowPlayingTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  nowPlayingArtist: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  nowPlayingMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  nowPlayingTimeText: {
    fontSize: 11,
  },
  nowPlayingRightActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: spacing.sm,
  },
  equalizerIndicator: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 22,
    gap: 2,
    marginRight: spacing.sm,
  },
  eqBar: {
    width: 3,
    borderRadius: 1.5,
  },
  playToggleBtn: {
    width: 34,
    height: 34,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    padding: spacing.xl,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginTop: 4,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: typography.sizes.xs,
    textAlign: "center",
    maxWidth: 320,
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  primaryAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radii.full,
    marginBottom: spacing.lg,
  },
  primaryAddBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
  },
  starterPacksSection: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "rgba(128, 128, 128, 0.15)",
    paddingTop: spacing.md,
  },
  starterPacksTitle: {
    fontSize: 10,
    fontWeight: "700",
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  starterPackRow: {
    gap: 8,
  },
  starterPackChip: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  starterPackEmoji: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  starterPackName: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
  },
  starterPackCount: {
    fontSize: 10,
    marginTop: 1,
  },
  queueList: {
    gap: 8,
    marginTop: 4,
  },
  queueItemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  reorderColumn: {
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    marginRight: 6,
  },
  arrowBtn: {
    padding: 2,
  },
  positionText: {
    fontSize: 10,
    fontWeight: "700",
    marginVertical: 1,
  },
  queueItemThumb: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
  },
  queueItemDetails: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  queueItemTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  queueItemArtist: {
    fontSize: 11,
    marginTop: 2,
  },
  addedByRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  addedByText: {
    fontSize: 10,
  },
  queueItemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 6,
  },
  upvoteBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  upvoteText: {
    fontSize: 10,
    fontWeight: "700",
  },
  actionIconBtn: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    gap: 12,
  },
  footerAddBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: radii.full,
  },
  footerAddBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
  },
  footerCloseBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radii.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  footerCloseBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: "600",
  },
});
