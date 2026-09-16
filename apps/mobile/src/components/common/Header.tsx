import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { typography, colors } from '../../theme/tokens';

interface HeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  isDark?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  leftAction,
  rightAction,
  isDark = false,
}) => {
  const palette = isDark ? colors.dark : colors.light;

  return (
    <View style={[styles.container, { borderBottomColor: palette.borderSubtle }]}>
      <View style={styles.sideAction}>{leftAction}</View>
      <View style={styles.center}>
        <Text style={[styles.title, { color: palette.textPrimary }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: palette.textSecondary }]}>{subtitle}</Text>
        ) : null}
      </View>
      <View style={styles.sideAction}>{rightAction}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sideAction: {
    minWidth: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.tight,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.regular,
    marginTop: 1,
  },
});
