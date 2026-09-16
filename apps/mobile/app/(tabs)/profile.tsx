import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Shield, Clock, Music } from 'lucide-react-native';
import { typography, colors, spacing, radii } from '../../src/theme/tokens';
import { useAuthStore } from '../../src/store/authStore';

export default function ProfileScreen() {
  const palette = colors.light;
  const user = useAuthStore((s) => s.user);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: palette.textTertiary }]}>· account</Text>
          <Text style={[styles.mainTitle, { color: palette.textPrimary }]}>Profile</Text>
        </View>

        <View style={[styles.profileCard, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
          <View style={[styles.avatarCircle, { backgroundColor: palette.accent }]}>
            <Text style={styles.avatarText}>{user?.displayName?.charAt(0) || 'S'}</Text>
          </View>
          <Text style={[styles.name, { color: palette.textPrimary }]}>{user?.displayName || 'Sanju'}</Text>
          <Text style={[styles.handle, { color: palette.textTertiary }]}>@{user?.username || 'sanju'}</Text>
          <Text style={[styles.bio, { color: palette.textSecondary }]}>{user?.bio}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Preferences & Privacy</Text>

          <View style={[styles.menuItem, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
            <View style={styles.menuLeft}>
              <Shield size={16} color={palette.textSecondary} style={{ marginRight: 10 }} />
              <Text style={[styles.menuText, { color: palette.textPrimary }]}>Room Listening Privacy</Text>
            </View>
            <Text style={[styles.menuValue, { color: palette.textTertiary }]}>Friends Only</Text>
          </View>

          <View style={[styles.menuItem, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
            <View style={styles.menuLeft}>
              <Music size={16} color={palette.textSecondary} style={{ marginRight: 10 }} />
              <Text style={[styles.menuText, { color: palette.textPrimary }]}>Default Music Provider</Text>
            </View>
            <Text style={[styles.menuValue, { color: palette.textTertiary }]}>Licensed Catalog</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: 40 },
  header: { marginTop: spacing.sm, marginBottom: spacing.lg },
  eyebrow: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  mainTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.tight,
  },
  profileCard: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: radii.xl,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { color: '#FFF', fontSize: 28, fontWeight: '600' },
  name: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold },
  handle: { fontSize: typography.sizes.sm, marginTop: 2 },
  bio: { fontSize: typography.sizes.xs, textAlign: 'center', marginTop: 8, paddingHorizontal: 20 },
  section: { marginTop: spacing.md },
  sectionTitle: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, marginBottom: spacing.md },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },
  menuValue: { fontSize: typography.sizes.xs },
});
