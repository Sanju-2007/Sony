import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Play, Pause, Volume2 } from "lucide-react-native";
import { useThemeStore } from "../../store/themeStore";
import { typography, radii, spacing } from "../../theme/tokens";

interface VoiceMessagePlayerProps {
  id: string;
  duration: number; // in seconds
  waveform: number[];
  isMe?: boolean;
  createdAt?: string;
}

export function VoiceMessagePlayer({
  id,
  duration,
  waveform,
  isMe = false,
  createdAt,
}: VoiceMessagePlayerProps) {
  const { palette } = useThemeStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0.0 to 1.0
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Normalize waveform to at least 12 bars
  const displayWaveform =
    waveform && waveform.length >= 8
      ? waveform
      : [0.35, 0.6, 0.85, 0.45, 0.7, 0.9, 0.5, 0.75, 0.4, 0.65, 0.3, 0.5];

  useEffect(() => {
    if (isPlaying) {
      const stepMs = 50;
      const totalSteps = (duration * 1000) / stepMs;
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 1 / totalSteps;
          if (next >= 1) {
            clearInterval(intervalRef.current as NodeJS.Timeout);
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
      }, stepMs);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, duration]);

  const togglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (progress >= 0.98) {
        setProgress(0);
      }
      setIsPlaying(true);
    }
  };

  const handleBarTap = (index: number) => {
    const newProgress = index / displayWaveform.length;
    setProgress(newProgress);
    if (!isPlaying) setIsPlaying(true);
  };

  const currentSeconds = Math.floor(progress * duration);
  const totalSeconds = duration;
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isMe ? palette.accent : palette.surface,
          borderColor: isMe ? "transparent" : palette.borderSubtle,
        },
      ]}
    >
      {/* Play / Pause Toggle Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.playBtn,
          { backgroundColor: isMe ? palette.accentInverted : palette.accent },
        ]}
        onPress={togglePlayback}
      >
        {isPlaying ? (
          <Pause
            size={13}
            color={isMe ? palette.accent : palette.accentInverted}
          />
        ) : (
          <Play
            size={13}
            color={isMe ? palette.accent : palette.accentInverted}
            style={{ marginLeft: 2 }}
          />
        )}
      </TouchableOpacity>

      {/* Waveform Visualizer with seek tap */}
      <View style={styles.waveformRow}>
        {displayWaveform.map((bar, i) => {
          const barRatio = i / displayWaveform.length;
          const isPlayed = progress >= barRatio;
          const barHeight = Math.max(6, Math.min(26, Math.round(bar * 26)));

          return (
            <TouchableOpacity
              key={i}
              onPress={() => handleBarTap(i)}
              style={styles.barTouchWrapper}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.waveBar,
                  {
                    height: barHeight,
                    backgroundColor: isMe
                      ? isPlayed
                        ? palette.accentInverted
                        : "rgba(255,255,255,0.4)"
                      : isPlayed
                      ? palette.accent
                      : palette.border,
                  },
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Duration Label */}
      <View style={styles.metaRow}>
        <Text
          style={[
            styles.timerText,
            {
              color: isMe
                ? "rgba(255,255,255,0.85)"
                : palette.textSecondary,
            },
          ]}
        >
          {isPlaying ? formatTime(currentSeconds) : formatTime(totalSeconds)}
        </Text>
        {createdAt && (
          <Text
            style={[
              styles.timeCreated,
              {
                color: isMe
                  ? "rgba(255,255,255,0.6)"
                  : palette.textTertiary,
              },
            ]}
          >
            {createdAt}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radii.lg,
    borderWidth: 1,
    minWidth: 190,
    maxWidth: 260,
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  waveformRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 28,
    marginRight: 8,
    gap: 2.5,
  },
  barTouchWrapper: {
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  waveBar: {
    width: 3,
    borderRadius: 1.5,
  },
  metaRow: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  timerText: {
    fontSize: typography.sizes.xs,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontWeight: typography.weights.medium,
  },
  timeCreated: {
    fontSize: 9,
    marginTop: 1,
  },
});
