import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LyricLine, TrackMetadata } from "@sony/types";
import { typography, spacing, radii } from "../../theme/tokens";
import { useThemeStore } from "../../store/themeStore";
import { getSynchronizedLyrics } from "../../services/lyricsService";
import { Sparkles, Sliders, RotateCcw, Play } from "lucide-react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface SynchronizedLyricsProps {
  track?: TrackMetadata | null;
  trackId?: string;
  positionMs: number;
  onSeek: (targetMs: number) => void;
}

export function SynchronizedLyrics({
  track,
  trackId = "track-01",
  positionMs,
  onSeek,
}: SynchronizedLyricsProps) {
  const { palette } = useThemeStore();
  const scrollViewRef = useRef<ScrollView>(null);

  const [lines, setLines] = useState<LyricLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncOffsetMs, setSyncOffsetMs] = useState(0); // Offset in ms (positive = lyrics lead, negative = lyrics lag)
  const [userIsScrolling, setUserIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<any>(null);

  // Fetch or retrieve synchronized lyrics whenever track changes
  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);

    getSynchronizedLyrics(track || { id: trackId })
      .then((loadedLines) => {
        if (isCurrent) {
          setLines(loadedLines);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [track?.id, track?.title, track?.artist, trackId]);

  // Compute effective playback timestamp with user calibration offset
  const effectivePosMs = Math.max(0, positionMs + syncOffsetMs);

  // Determine current active line index using binary/linear search
  const activeIndex = useMemo(() => {
    if (lines.length === 0) return 0;
    let active = 0;
    for (let i = 0; i < lines.length; i++) {
      if (effectivePosMs >= lines[i].timeMs) {
        active = i;
      } else {
        break;
      }
    }
    return active;
  }, [lines, effectivePosMs]);

  // Compute progress through the active line (0.0 to 1.0)
  const activeLineProgress = useMemo(() => {
    if (lines.length === 0 || activeIndex >= lines.length) return 0;
    const currentLine = lines[activeIndex];
    const nextLine = lines[activeIndex + 1];
    if (!nextLine) return 1.0;
    const lineDuration = Math.max(1000, nextLine.timeMs - currentLine.timeMs);
    const elapsed = effectivePosMs - currentLine.timeMs;
    return Math.min(1.0, Math.max(0.0, elapsed / lineDuration));
  }, [lines, activeIndex, effectivePosMs]);

  // Smooth autoscroll to keep active line centered in the viewport
  useEffect(() => {
    if (userIsScrolling || lines.length === 0) return;
    const ESTIMATED_LINE_HEIGHT = 56;
    const targetY = Math.max(0, activeIndex * ESTIMATED_LINE_HEIGHT - 110);
    scrollViewRef.current?.scrollTo({ y: targetY, animated: true });
  }, [activeIndex, userIsScrolling, lines.length]);

  const handleUserScrollBegin = () => {
    setUserIsScrolling(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
  };

  const handleUserScrollEnd = () => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    // Resume auto-scroll after 3 seconds of user inactivity
    scrollTimeoutRef.current = setTimeout(() => {
      setUserIsScrolling(false);
    }, 3000);
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      {/* Top Status & Sync Calibration Bar */}
      <View style={[styles.headerBar, { borderBottomColor: palette.borderSubtle }]}>
        <View style={styles.headerLeft}>
          <Sparkles size={13} color={palette.duckingIndicator} style={{ marginRight: 5 }} />
          <Text style={[styles.headerBadgeText, { color: palette.textSecondary }]}>
            {isLoading
              ? "Syncing Lyrics..."
              : `Synced (${activeIndex + 1}/${lines.length || 1}) · Tap line to seek`}
          </Text>
        </View>

        {/* Sync Micro-Calibration Buttons */}
        <View style={styles.syncToolsRow}>
          <TouchableOpacity
            style={[styles.syncBtn, { borderColor: palette.borderSubtle, backgroundColor: palette.background }]}
            onPress={() => setSyncOffsetMs((prev) => prev - 500)}
            accessibilityLabel="Delay lyrics by 0.5s"
          >
            <Text style={[styles.syncBtnText, { color: palette.textSecondary }]}>-0.5s</Text>
          </TouchableOpacity>

          {syncOffsetMs !== 0 && (
            <TouchableOpacity
              style={[styles.syncBtn, { borderColor: palette.duckingIndicator, backgroundColor: "rgba(99,102,241,0.12)" }]}
              onPress={() => setSyncOffsetMs(0)}
              accessibilityLabel="Reset sync calibration"
            >
              <RotateCcw size={10} color={palette.duckingIndicator} style={{ marginRight: 3 }} />
              <Text style={[styles.syncBtnText, { color: palette.duckingIndicator, fontWeight: "700" }]}>
                {syncOffsetMs > 0 ? `+${syncOffsetMs / 1000}s` : `${syncOffsetMs / 1000}s`}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.syncBtn, { borderColor: palette.borderSubtle, backgroundColor: palette.background }]}
            onPress={() => setSyncOffsetMs((prev) => prev + 500)}
            accessibilityLabel="Advance lyrics by 0.5s"
          >
            <Text style={[styles.syncBtnText, { color: palette.textSecondary }]}>+0.5s</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lyrics Scroll View */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={palette.duckingIndicator} />
          <Text style={[styles.loadingText, { color: palette.textSecondary }]}>
            Finding accurate synchronized timestamps...
          </Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={handleUserScrollBegin}
          onScrollEndDrag={handleUserScrollEnd}
          onMomentumScrollEnd={handleUserScrollEnd}
        >
          {lines.map((line, idx) => {
            const isActive = idx === activeIndex;
            const isPassed = idx < activeIndex;

            return (
              <TouchableOpacity
                key={`${idx}-${line.timeMs}`}
                activeOpacity={0.7}
                style={[
                  styles.lineWrapper,
                  isActive && [
                    styles.activeLineWrapper,
                    {
                      backgroundColor: "rgba(99, 102, 241, 0.10)",
                      borderColor: "rgba(99, 102, 241, 0.28)",
                      borderWidth: 1,
                    },
                  ],
                ]}
                onPress={() => {
                  onSeek(line.timeMs);
                  setUserIsScrolling(false);
                }}
              >
                {/* Karaoke Active Indicator Dot */}
                {isActive && (
                  <View style={styles.activeDotRow}>
                    <View style={[styles.activeDot, { backgroundColor: palette.duckingIndicator }]} />
                    <Text style={[styles.activeTimestamp, { color: palette.duckingIndicator }]}>
                      {formatTime(line.timeMs)}
                    </Text>
                  </View>
                )}

                <Text
                  style={[
                    styles.lyricText,
                    isActive
                      ? [styles.activeLyricText, { color: palette.textPrimary }]
                      : isPassed
                      ? [styles.passedLyricText, { color: palette.textTertiary }]
                      : [styles.upcomingLyricText, { color: palette.textSecondary }],
                    line.isChorus && styles.chorusLyricText,
                  ]}
                >
                  {line.text}
                </Text>

                {/* Real-time Karaoke syllable progress glow bar */}
                {isActive && (
                  <View style={[styles.progressTrack, { backgroundColor: "rgba(255,255,255,0.12)" }]}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${Math.round(activeLineProgress * 100)}%`,
                          backgroundColor: palette.duckingIndicator,
                        },
                      ]}
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          <View style={{ height: 60 }} />
        </ScrollView>
      )}
    </View>
  );
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

const styles = StyleSheet.create({
  container: {
    height: 310,
    width: "100%",
    borderRadius: radii.xl,
    overflow: "hidden",
    marginVertical: spacing.sm,
    borderWidth: 1,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
  },
  syncToolsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  syncBtn: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radii.sm,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  syncBtnText: {
    fontSize: 10,
    fontWeight: typography.weights.medium,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
  },
  scrollContent: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
  },
  lineWrapper: {
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    width: "100%",
    alignItems: "center",
    marginVertical: 3,
  },
  activeLineWrapper: {
    transform: [{ scale: 1.02 }],
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  activeDotRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 5,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeTimestamp: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  lyricText: {
    textAlign: "center",
    letterSpacing: typography.letterSpacing.tight,
  },
  activeLyricText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  passedLyricText: {
    fontSize: typography.sizes.sm,
    opacity: 0.45,
  },
  upcomingLyricText: {
    fontSize: typography.sizes.sm,
    opacity: 0.75,
  },
  chorusLyricText: {
    fontStyle: "italic",
  },
  progressTrack: {
    height: 3,
    width: "80%",
    borderRadius: 1.5,
    marginTop: 6,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 1.5,
  },
});
