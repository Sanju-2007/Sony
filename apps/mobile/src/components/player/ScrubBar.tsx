import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { typography, colors } from '../../theme/tokens';

interface ScrubBarProps {
  positionMs: number;
  durationMs: number;
  onSeek?: (positionMs: number) => void;
  isDark?: boolean;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export const ScrubBar: React.FC<ScrubBarProps> = ({
  positionMs,
  durationMs,
  onSeek,
  isDark = false,
}) => {
  const palette = isDark ? colors.dark : colors.light;
  const progress = durationMs > 0 ? Math.min(1, Math.max(0, positionMs / durationMs)) : 0;

  return (
    <View style={styles.container}>
      <View style={[styles.trackBackground, { backgroundColor: palette.accentMuted }]}>
        <View
          style={[
            styles.trackFill,
            {
              width: `${progress * 100}%`,
              backgroundColor: palette.textPrimary,
            },
          ]}
        />
      </View>
      <View style={styles.timeRow}>
        <Text style={[styles.timeText, { color: palette.textTertiary }]}>{formatTime(positionMs)}</Text>
        <Text style={[styles.timeText, { color: palette.textTertiary }]}>{formatTime(durationMs)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 12,
  },
  trackBackground: {
    height: 3,
    borderRadius: 1.5,
    width: '100%',
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: typography.sizes.xs,
    fontVariant: ['tabular-nums'],
    letterSpacing: typography.letterSpacing.normal,
  },
});
