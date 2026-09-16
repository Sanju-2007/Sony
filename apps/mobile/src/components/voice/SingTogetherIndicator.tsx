import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { typography, colors } from '../../theme/tokens';
import { DuckingState } from '@sony/types';

interface SingTogetherIndicatorProps {
  volume: number;
  duckingState: DuckingState;
  isDark?: boolean;
}

export const SingTogetherIndicator: React.FC<SingTogetherIndicatorProps> = ({
  volume,
  duckingState,
  isDark = false,
}) => {
  const palette = isDark ? colors.dark : colors.light;
  const isDucked = duckingState !== 'IDLE';
  const volumePercentage = Math.round(volume * 100);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: isDucked ? 'rgba(99, 102, 241, 0.12)' : palette.surface,
          borderColor: isDucked ? palette.duckingIndicator : palette.border,
        },
      ]}
    >
      <View
        style={[
          styles.dot,
          { backgroundColor: isDucked ? palette.duckingIndicator : palette.textTertiary },
        ]}
      />
      <Text
        style={[
          styles.text,
          { color: isDucked ? palette.duckingIndicator : palette.textSecondary },
        ]}
      >
        {isDucked ? `Sing Together Active (${volumePercentage}%)` : 'Music at 100%'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    alignSelf: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  text: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    letterSpacing: typography.letterSpacing.tight,
  },
});
