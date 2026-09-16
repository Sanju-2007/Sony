import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Play, Pause, SkipForward, Radio } from "lucide-react-native";
import { usePlaybackStore } from "../../store/playbackStore";
import { useRoomStore } from "../../store/roomStore";
import { typography, colors, spacing, radii } from "../../theme/tokens";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function MiniPlayer() {
  const router = useRouter();
  const palette = colors.light;

  const { currentTrack, isPlaying, togglePlay, playNext, positionMs, durationMs } =
    usePlaybackStore();
  const { currentRoom } = useRoomStore();

  if (!currentTrack) return null;

  const progressPercent = durationMs > 0 ? (positionMs / durationMs) * 100 : 0;

  const handlePressCard = () => {
    const targetRoomId = currentRoom?.id || "room-late-night-1";
    router.push("/room/" + targetRoomId);
  };

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
                backgroundColor: palette.textPrimary,
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
              style={[styles.playPauseBtn, { backgroundColor: palette.textPrimary }]}
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
});
