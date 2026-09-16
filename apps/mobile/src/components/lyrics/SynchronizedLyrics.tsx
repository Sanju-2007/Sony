import React, { useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LyricLine } from "@sony/types";
import { typography, colors, spacing, radii } from "../../theme/tokens";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const CURATED_LYRICS: Record<string, LyricLine[]> = {
  default: [
    { timeMs: 0, text: "♪ [Ambient Synthesizer Soundscape] ♪" },
    { timeMs: 12000, text: "Night falls over the city skyline" },
    { timeMs: 24000, text: "Listening together across the wire" },
    { timeMs: 38000, text: "Every frequency in perfect harmony" },
    { timeMs: 52000, text: "Voices blending softly with the beat" },
    { timeMs: 70000, text: "No distance can keep us apart tonight" },
    { timeMs: 90000, text: "♪ [Deep Resonance & Bass Wave] ♪" },
    { timeMs: 110000, text: "Stay right here in the music" },
    { timeMs: 130000, text: "Echoes drifting into the horizon" },
    { timeMs: 160000, text: "♪ [Gentle Fade Out] ♪" },
  ],
  "track-01": [
    { timeMs: 0, text: "♪ [80s Synth Intro & Driving Arpeggio] ♪" },
    { timeMs: 16000, text: "Yeah, I've been tryna call" },
    { timeMs: 21000, text: "I've been on my own for long enough" },
    { timeMs: 27000, text: "Maybe you can show me how to love, maybe" },
    { timeMs: 36000, text: "I'm going through withdrawals" },
    { timeMs: 41000, text: "You don't even have to do too much" },
    { timeMs: 47000, text: "You can turn me on with just a touch, baby" },
    { timeMs: 58000, text: "I look around and Sin City's cold and empty" },
    { timeMs: 65000, text: "No one's around to judge me" },
    { timeMs: 71000, text: "I can't see clearly when you're gone" },
    { timeMs: 78000, text: "I said, ooh, I'm blinded by the lights", isChorus: true },
    { timeMs: 86000, text: "No, I can't sleep until I feel your touch", isChorus: true },
    { timeMs: 94000, text: "I said, ooh, I'm drowning in the night", isChorus: true },
    { timeMs: 102000, text: "Oh, when I'm like this, you're the one I trust", isChorus: true },
    { timeMs: 115000, text: "♪ [Euphoric Synth Lead & Hook] ♪" },
    { timeMs: 134000, text: "I'm running out of time" },
    { timeMs: 140000, text: "'Cause I can see the sun light up the sky" },
    { timeMs: 147000, text: "So I hit the road in overdrive, baby" },
    { timeMs: 156000, text: "The city's cold and empty" },
    { timeMs: 164000, text: "I said, ooh, I'm blinded by the lights", isChorus: true },
    { timeMs: 172000, text: "No, I can't sleep until I feel your touch", isChorus: true },
  ],
};

interface SynchronizedLyricsProps {
  trackId?: string;
  positionMs: number;
  onSeek: (targetMs: number) => void;
}

export function SynchronizedLyrics({
  trackId = "track-01",
  positionMs,
  onSeek,
}: SynchronizedLyricsProps) {
  const palette = colors.light;
  const scrollViewRef = useRef<ScrollView>(null);

  const lines = useMemo(() => {
    return CURATED_LYRICS[trackId] || CURATED_LYRICS["track-01"] || CURATED_LYRICS.default;
  }, [trackId]);

  // Determine current active line index
  const activeIndex = useMemo(() => {
    let active = 0;
    for (let i = 0; i < lines.length; i++) {
      if (positionMs >= lines[i].timeMs) {
        active = i;
      } else {
        break;
      }
    }
    return active;
  }, [lines, positionMs]);

  // Autoscroll to active line
  useEffect(() => {
    const LINE_ESTIMATE_HEIGHT = 58;
    const targetY = Math.max(0, activeIndex * LINE_ESTIMATE_HEIGHT - 90);
    scrollViewRef.current?.scrollTo({ y: targetY, animated: true });
  }, [activeIndex]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {lines.map((line, idx) => {
          const isActive = idx === activeIndex;
          const isPassed = idx < activeIndex;

          return (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.7}
              style={[
                styles.lineWrapper,
                isActive && [
                  styles.activeLineWrapper,
                  { backgroundColor: "rgba(0,0,0,0.04)" },
                ],
              ]}
              onPress={() => onSeek(line.timeMs)}
            >
              <Text
                style={[
                  styles.lyricText,
                  isActive
                    ? [
                        styles.activeLyricText,
                        { color: palette.textPrimary },
                      ]
                    : isPassed
                    ? [styles.passedLyricText, { color: palette.textTertiary }]
                    : [styles.upcomingLyricText, { color: palette.textSecondary }],
                ]}
              >
                {line.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 270,
    width: "100%",
    borderRadius: radii.xl,
    overflow: "hidden",
    marginVertical: spacing.sm,
  },
  scrollContent: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
  },
  lineWrapper: {
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    width: "100%",
    alignItems: "center",
  },
  activeLineWrapper: {
    transform: [{ scale: 1.04 }],
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
});
