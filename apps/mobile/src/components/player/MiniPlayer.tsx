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
import { useThemeStore } from "../../store/themeStore";
import { typography, spacing, radii } from "../../theme/tokens";

interface MiniPlayerProps {
  isDesktop?: boolean;
}

export function MiniPlayer({ isDesktop: propIsDesktop }: MiniPlayerProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = propIsDesktop ?? width >= 860;
  const { isDark, palette } = useThemeStore();

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
      <View
        style={[
          styles.desktopOuter,
          {
            backgroundColor: palette.surface,
            borderTopColor: palette.border,
          },
        ]}
      >
        {/* Top Progress Line */}
        <View
          style={[
            styles.progressBarBackground,
            { backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)" },
          ]}
        >
          <View
            style={[
              styles.progressBarFill,
              { width: (`${progressPercent}%` as any), backgroundColor: palette.accent },
            ]}
          />
        </View>

        <View style={styles.desktopContent}>
          {/* Left: Track info */}
          <TouchableOpacity activeOpacity={0.85} style={styles.desktopTrackInfo} onPress={handlePressCard}>
            <Image source={{ uri: currentTrack.artworkUrl }} style={styles.desktopArtwork} />
            <View style={styles.desktopTextWrap}>
              <Text style={[styles.desktopTitle, { color: palette.textPrimary }]} numberOfLines={1}>
                {currentTrack.title}
              </Text>
              <View style={styles.subtitleRow}>
                {isPlaying && <View style={[styles.pulsingDot, { backgroundColor: "#10B981" }]} />}
                <Text style={[styles.desktopArtist, { color: palette.textSecondary }]} numberOfLines={1}>
                  {currentTrack.artist} · <Text style={{ color: palette.textPrimary, fontWeight: "600" }}>{currentRoom?.name || "Listening Room"}</Text>
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Center: Playback Controls & Scrubber */}
          <View style={styles.desktopCenterControls}>
            <View style={styles.desktopBtnRow}>
              <TouchableOpacity style={styles.iconBtn} onPress={togglePlay}>
                <SkipBack size={16} color={palette.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.desktopPlayBtn, { backgroundColor: palette.accent }]}
                onPress={togglePlay}
              >
                {isPlaying ? (
                  <Pause size={16} color={palette.accentInverted} />
                ) : (
                  <Play size={16} color={palette.accentInverted} style={{ marginLeft: 2 }} />
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={playNext}>
                <SkipForward size={16} color={palette.textPrimary} />
              </TouchableOpacity>
            </View>
            <View style={styles.desktopScrubRow}>
              <Text style={[styles.timeText, { color: palette.textTertiary }]}>{formatTime(positionMs)}</Text>
              <View
                style={[
                  styles.desktopScrubTrack,
                  { backgroundColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)" },
                ]}
              >
                <View
                  style={[
                    styles.desktopScrubFill,
                    { width: (`${progressPercent}%` as any), backgroundColor: palette.accent },
                  ]}
                />
              </View>
              <Text style={[styles.timeText, { color: palette.textTertiary }]}>{formatTime(durationMs || 200000)}</Text>
            </View>
          </View>

          {/* Right: Sound Tools & Expand */}
          <View style={styles.desktopRightTools}>
            <View
              style={[
                styles.syncBadge,
                {
                  backgroundColor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)",
                  borderColor: palette.border,
                },
              ]}
            >
              <View style={[styles.syncDot, { backgroundColor: "#10B981" }]} />
              <Text style={[styles.syncBadgeText, { color: palette.textPrimary }]}>Lossless · &lt;15ms Sync</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.expandRoomBtn, { backgroundColor: palette.accent }]}
              onPress={handlePressCard}
            >
              <Maximize2 size={13} color={palette.accentInverted} style={{ marginRight: 6 }} />
              <Text style={[styles.expandRoomText, { color: palette.accentInverted }]}>Open Stage</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Mobile Floating Dock
  return (
    <View style={styles.mobileDockContainer}>
      <TouchableOpacity
        activeOpacity={0.92}
        style={[
          styles.mobileDockCard,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
          },
        ]}
        onPress={handlePressCard}
      >
        <Image source={{ uri: currentTrack.artworkUrl }} style={styles.mobileDockThumb} />
        <View style={styles.mobileDockInfo}>
          <Text style={[styles.mobileDockTitle, { color: palette.textPrimary }]} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={[styles.mobileDockArtist, { color: palette.textSecondary }]} numberOfLines={1}>
            {currentTrack.artist} · {currentRoom?.name || "Listening Room"}
          </Text>
        </View>

        <View style={styles.mobileDockActions}>
          <TouchableOpacity
            style={[styles.playPauseBtn, { backgroundColor: palette.accent }]}
            onPress={togglePlay}
          >
            {isPlaying ? (
              <Pause size={14} color={palette.accentInverted} />
            ) : (
              <Play size={14} color={palette.accentInverted} style={{ marginLeft: 2 }} />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} onPress={playNext}>
            <SkipForward size={16} color={palette.textPrimary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  progressBarBackground: {
    width: "100%",
    height: 2,
  },
  progressBarFill: {
    height: 2,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  syncDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 6,
  },
  mobileDockContainer: {
    position: "absolute",
    bottom: 56,
    left: 12,
    right: 12,
    zIndex: 999,
  },
  mobileDockCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  mobileDockThumb: {
    width: 42,
    height: 42,
    borderRadius: 8,
  },
  mobileDockInfo: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  mobileDockTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  mobileDockArtist: {
    fontSize: 11,
    marginTop: 2,
  },
  mobileDockActions: {
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
    borderTopWidth: 1,
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
  },
  desktopArtist: {
    fontSize: 12,
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
    minWidth: 32,
  },
  desktopScrubTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  desktopScrubFill: {
    height: "100%",
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
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  syncBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  expandRoomBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  expandRoomText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
