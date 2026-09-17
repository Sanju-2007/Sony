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
              { width: (`${progressPercent}%` as any), backgroundColor: "#0A0A0A" },
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
                {isPlaying && <View style={[styles.pulsingDot, { backgroundColor: "#10B981" }]} />}
                <Text style={styles.desktopArtist} numberOfLines={1}>
                  {currentTrack.artist} · <Text style={{ color: "#0A0A0A", fontWeight: "600" }}>{currentRoom?.name || "Late Night Family"}</Text>
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Center: Playback Controls & Scrubber */}
          <View style={styles.desktopCenterControls}>
            <View style={styles.desktopBtnRow}>
              <TouchableOpacity style={styles.iconBtn} onPress={togglePlay}>
                <SkipBack size={16} color="#0A0A0A" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.desktopPlayBtn, { backgroundColor: "#0A0A0A" }]}
                onPress={togglePlay}
              >
                {isPlaying ? <Pause size={16} color="#FFFFFF" /> : <Play size={16} color="#FFFFFF" style={{ marginLeft: 2 }} />}
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={playNext}>
                <SkipForward size={16} color="#0A0A0A" />
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
              <View style={[styles.pulsingDot, { backgroundColor: "#10B981" }]} />
              <Text style={styles.syncBadgeText}>Lossless · &lt;15ms Sync</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.expandRoomBtn}
              onPress={handlePressCard}
            >
              <Maximize2 size={13} color="#FFFFFF" style={{ marginRight: 6 }} />
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
            backgroundColor: "rgba(255, 255, 255, 0.88)",
            borderColor: "rgba(0, 0, 0, 0.08)",
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
                backgroundColor: "#0A0A0A",
              },
            ]}
          />
        </View>

        <View style={styles.innerContent}>
          {/* Artwork */}
          <Image source={{ uri: currentTrack.artworkUrl }} style={styles.artwork} />

          {/* Track and Room Info */}
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: "#0A0A0A" }]} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <View style={styles.subtitleRow}>
              {isPlaying && (
                <View style={[styles.pulsingDot, { backgroundColor: "#10B981" }]} />
              )}
              <Text style={[styles.artist, { color: "#52525B" }]} numberOfLines={1}>
                {currentTrack.artist} · {currentRoom?.name || "Listening"}
              </Text>
            </View>
          </View>

          {/* Quick Playback Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.playPauseBtn, { backgroundColor: "#0A0A0A" }]}
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
              <SkipForward size={16} color="#0A0A0A" />
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
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.08)",
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
    fontWeight: "700",
    color: "#0A0A0A",
  },
  desktopArtist: {
    fontSize: 12,
    color: "#52525B",
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
    color: "#71717A",
    minWidth: 32,
  },
  desktopScrubTrack: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(0, 0, 0, 0.08)",
    borderRadius: 2,
    overflow: "hidden",
  },
  desktopScrubFill: {
    height: "100%",
    backgroundColor: "#0A0A0A",
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
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    borderColor: "rgba(0, 0, 0, 0.08)",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  syncBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#0A0A0A",
  },
  expandRoomBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  expandRoomText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
