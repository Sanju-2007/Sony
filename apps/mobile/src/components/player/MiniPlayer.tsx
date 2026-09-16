import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Play, Pause, SkipForward, SkipBack, Maximize2, Sliders, Volume2 } from "lucide-react-native";
import { usePlaybackStore } from "../../store/playbackStore";
import { useRoomStore } from "../../store/roomStore";
import { typography, colors, spacing, radii } from "../../theme/tokens";

interface MiniPlayerProps {
  isDesktop?: boolean;
}

export function MiniPlayer({ isDesktop: propIsDesktop }: MiniPlayerProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = propIsDesktop ?? width >= 860;
  const palette = colors.dark;

  const { currentTrack, isPlaying, togglePlay, playNext, positionMs, durationMs } =
    usePlaybackStore();
  const { currentRoom } = useRoomStore();

  if (!currentTrack) return null;

  const progressPercent = durationMs > 0 ? (positionMs / durationMs) * 100 : 0;
  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handlePressCard = () => {
    const targetRoomId = currentRoom?.id || "room-late-night-1";
    router.push("/room/" + targetRoomId);
  };

  if (isDesktop) {
    return (
      <View style={styles.desktopOuter}>
        {/* Top Progress Line */}
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: (`${progressPercent}%` as any), backgroundColor: "#6366F1" },
            ]}
          />
        </View>

        <View style={styles.desktopContent}>
          {/* Left: Track info */}
          <TouchableOpacity activeOpacity={0.85} style={styles.desktopTrackInfo} onPress={handlePressCard}>
            <Image source={{ uri: currentTrack.artworkUrl }} style={styles.desktopArtwork} />
            <View style={styles.desktopTextWrap}>
              <Text style={styles.desktopTitle} numberOfLines={1}>
                {currentTrack.title}
              </Text>
              <View style={styles.subtitleRow}>
                {isPlaying && <View style={[styles.pulsingDot, { backgroundColor: palette.speaking }]} />}
                <Text style={styles.desktopArtist} numberOfLines={1}>
                  {currentTrack.artist} · <Text style={{ color: "#818CF8" }}>{currentRoom?.name || "Late Night Family"}</Text>
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Center: Playback Controls & Scrubber */}
          <View style={styles.desktopCenterControls}>
            <View style={styles.desktopBtnRow}>
              <TouchableOpacity style={styles.iconBtn} onPress={togglePlay}>
                <SkipBack size={16} color="#94A3B8" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.desktopPlayBtn, { backgroundColor: "#6366F1" }]}
                onPress={togglePlay}
              >
                {isPlaying ? <Pause size={16} color="#FFFFFF" /> : <Play size={16} color="#FFFFFF" style={{ marginLeft: 2 }} />}
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={playNext}>
                <SkipForward size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <View style={styles.desktopScrubRow}>
              <Text style={styles.timeText}>{formatTime(positionMs)}</Text>
              <View style={styles.desktopScrubTrack}>
                <View style={[styles.desktopScrubFill, { width: (`${progressPercent}%` as any) }]} />
              </View>
              <Text style={styles.timeText}>{formatTime(durationMs || 200000)}</Text>
            </View>
          </View>

          {/* Right: Sound Tools & Expand */}
          <View style={styles.desktopRightTools}>
            <View style={styles.syncBadge}>
              <View style={[styles.pulsingDot, { backgroundColor: palette.speaking }]} />
              <Text style={styles.syncBadgeText}>Lossless · &lt;15ms Sync</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.expandRoomBtn}
              onPress={handlePressCard}
            >
              <Maximize2 size={14} color="#F8FAFC" style={{ marginRight: 6 }} />
              <Text style={styles.expandRoomText}>Open Stage</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <TouchableOpacity
        activeOpacity={0.92}
        style={[
          styles.container,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
          },
        ]}
        onPress={handlePressCard}
      >
        {/* Top Mini Progress Line */}
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: (`${progressPercent}%` as any),
                backgroundColor: "#6366F1",
              },
            ]}
          />
        </View>

        <View style={styles.innerContent}>
          {/* Artwork */}
          <Image source={{ uri: currentTrack.artworkUrl }} style={styles.artwork} />

          {/* Track and Room Info */}
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: palette.textPrimary }]} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <View style={styles.subtitleRow}>
              {isPlaying && (
                <View style={[styles.pulsingDot, { backgroundColor: palette.speaking }]} />
              )}
              <Text style={[styles.artist, { color: palette.textSecondary }]} numberOfLines={1}>
                {currentTrack.artist} · {currentRoom?.name || "Listening"}
              </Text>
            </View>
          </View>

          {/* Quick Playback Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.playPauseBtn, { backgroundColor: "#6366F1" }]}
              onPress={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
            >
              {isPlaying ? (
                <Pause size={14} color="#FFFFFF" />
              ) : (
                <Play size={14} color="#FFFFFF" style={{ marginLeft: 2 }} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipBtn}
              onPress={(e) => {
                e.stopPropagation();
                playNext();
              }}
            >
              <SkipForward size={16} color={palette.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: "absolute",
    bottom: 58, // Sits right above standard tab bar height
    left: 12,
    right: 12,
    zIndex: 999,
  },
  container: {
    height: 56,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  progressBarBackground: {
    height: 2,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  progressBarFill: {
    height: 2,
  },
  innerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
  },
  artwork: {
    width: 38,
    height: 38,
    borderRadius: radii.sm,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
  },
  title: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.tight,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  pulsingDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 5,
  },
  artist: {
    fontSize: 11,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 8,
  },
  playPauseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  skipBtn: {
    padding: 6,
  },
  desktopOuter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 74,
    backgroundColor: "#111319",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
    zIndex: 9999,
  },
  desktopContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  desktopTrackInfo: {
    flexDirection: "row",
    alignItems: "center",
    width: 240,
  },
  desktopArtwork: {
    width: 46,
    height: 46,
    borderRadius: 8,
  },
  desktopTextWrap: {
    marginLeft: 12,
    flex: 1,
  },
  desktopTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F8FAFC",
  },
  desktopArtist: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  desktopCenterControls: {
    flex: 1,
    maxWidth: 540,
    alignItems: "center",
  },
  desktopBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 4,
  },
  iconBtn: {
    padding: 4,
  },
  desktopPlayBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  desktopScrubRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 8,
  },
  timeText: {
    fontSize: 11,
    color: "#64748B",
    minWidth: 32,
  },
  desktopScrubTrack: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 2,
    overflow: "hidden",
  },
  desktopScrubFill: {
    height: "100%",
    backgroundColor: "#6366F1",
    borderRadius: 2,
  },
  desktopRightTools: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    width: 240,
    justifyContent: "flex-end",
  },
  syncBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderColor: "rgba(16, 185, 129, 0.2)",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  syncBadgeText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#10B981",
  },
  expandRoomBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E2230",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  expandRoomText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#F8FAFC",
  },
});
