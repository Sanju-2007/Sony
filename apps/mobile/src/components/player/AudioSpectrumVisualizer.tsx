import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { colors, radii } from "../../theme/tokens";
import { DuckingState } from "@sony/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const NUM_BARS = 22;

interface AudioSpectrumVisualizerProps {
  isPlaying: boolean;
  volume: number; // 0.0 to 1.0 (from ducking controller)
  duckingState: DuckingState;
  isVoiceActive: boolean;
}

export function AudioSpectrumVisualizer({
  isPlaying,
  volume,
  duckingState,
  isVoiceActive,
}: AudioSpectrumVisualizerProps) {
  const palette = colors.light;
  const [barHeights, setBarHeights] = useState<number[]>(
    Array.from({ length: NUM_BARS }, () => 4)
  );

  useEffect(() => {
    if (!isPlaying) {
      setBarHeights(Array.from({ length: NUM_BARS }, () => 4));
      return;
    }

    let frameId: number;
    let step = 0;

    const animate = () => {
      step += 0.12;
      const heights = Array.from({ length: NUM_BARS }, (_, i) => {
        // Generate pseudo-frequency waveform with harmonics
        const freq1 = Math.sin(step + i * 0.4);
        const freq2 = Math.cos(step * 1.4 + i * 0.25);
        const combined = Math.abs(freq1 * 0.6 + freq2 * 0.4);

        // Modulate amplitude by playback volume
        const maxH = isVoiceActive ? 32 : 24;
        const h = Math.max(4, Math.round(combined * maxH * volume));
        return h;
      });

      setBarHeights(heights);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, volume, isVoiceActive]);

  return (
    <View style={styles.container}>
      {barHeights.map((h, i) => {
        const isCenter = Math.abs(i - NUM_BARS / 2) < 4;
        return (
          <View
            key={i}
            style={[
              styles.bar,
              {
                height: h,
                backgroundColor: isVoiceActive
                  ? isCenter
                    ? palette.duckingIndicator
                    : palette.speaking
                  : isPlaying
                  ? palette.textPrimary
                  : palette.border,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 38,
    gap: 3,
    marginVertical: 4,
  },
  bar: {
    width: 3.5,
    borderRadius: 2,
  },
});
