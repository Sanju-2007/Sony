import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Shield,
  Music,
  Sliders,
  Radio,
  Clock,
  Sparkles,
  Check,
  Edit3,
  X,
  Eye,
  EyeOff,
  Zap,
} from "lucide-react-native";
import { typography, colors, spacing, radii } from "../../src/theme/tokens";
import { useAuthStore } from "../../src/store/authStore";
import { usePlaybackStore, DUCKING_PROFILES, DuckingProfileType } from "../../src/store/playbackStore";

type PrivacyMode = "PUBLIC" | "FRIENDS" | "GHOST";

export default function ProfileScreen() {
  const palette = colors.light;
  const user = useAuthStore((s) => s.user);
  const { duckingProfile, setDuckingProfile } = usePlaybackStore();

  const [privacyMode, setPrivacyMode] = useState<PrivacyMode>("FRIENDS");
  const [hdAudio, setHdAudio] = useState(true);
  const [driftNudge, setDriftNudge] = useState(true);

  // Edit profile state
  const [showEditModal, setShowEditModal] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "Sanju");
  const [bio, setBio] = useState(
    user?.bio || "Deep lo-fi beats, synthwave sunsets, and late night conversations."
  );

  const stats = [
    { label: "Hours Synced", value: "42.5 h" },
    { label: "Rooms Hosted", value: "14" },
    { label: "Tracks Queued", value: "38" },
    { label: "Sync Precision", value: "<15ms" },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: palette.textTertiary }]}>· account & engine</Text>
          <Text style={[styles.mainTitle, { color: palette.textPrimary }]}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
          <View style={[styles.avatarCircle, { backgroundColor: palette.accent }]}>
            <Text style={styles.avatarText}>{displayName.charAt(0) || "S"}</Text>
          </View>
          <Text style={[styles.name, { color: palette.textPrimary }]}>{displayName}</Text>
          <Text style={[styles.handle, { color: palette.textTertiary }]}>@{user?.username || "sanju"}</Text>
          <Text style={[styles.bio, { color: palette.textSecondary }]}>{bio}</Text>

          <TouchableOpacity
            style={[styles.editProfileBtn, { backgroundColor: palette.background, borderColor: palette.border }]}
            onPress={() => setShowEditModal(true)}
          >
            <Edit3 size={13} color={palette.textPrimary} style={{ marginRight: 6 }} />
            <Text style={[styles.editProfileText, { color: palette.textPrimary }]}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Listening Statistics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Listening Analytics</Text>
          <View style={styles.statsGrid}>
            {stats.map((s, idx) => (
              <View
                key={idx}
                style={[
                  styles.statCard,
                  { backgroundColor: palette.surface, borderColor: palette.borderSubtle },
                ]}
              >
                <Text style={[styles.statValue, { color: palette.textPrimary }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: palette.textTertiary }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Playback & Sync Engine Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Audio Engine Preferences</Text>

          <View style={[styles.menuItem, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
            <View style={styles.menuLeft}>
              <Radio size={16} color={palette.textSecondary} style={{ marginRight: 10 }} />
              <View>
                <Text style={[styles.menuText, { color: palette.textPrimary }]}>HD WebRTC Opus (48kHz)</Text>
                <Text style={[styles.menuSubtext, { color: palette.textTertiary }]}>Studio grade 160kbps low-latency voice</Text>
              </View>
            </View>
            <Switch
              value={hdAudio}
              onValueChange={setHdAudio}
              trackColor={{ true: palette.speaking, false: palette.border }}
            />
          </View>

          <View style={[styles.menuItem, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
            <View style={styles.menuLeft}>
              <Zap size={16} color={palette.textSecondary} style={{ marginRight: 10 }} />
              <View>
                <Text style={[styles.menuText, { color: palette.textPrimary }]}>Micro-Drift Pitch Correction</Text>
                <Text style={[styles.menuSubtext, { color: palette.textTertiary }]}>Nudge rate (0.95x / 1.05x) without clicks</Text>
              </View>
            </View>
            <Switch
              value={driftNudge}
              onValueChange={setDriftNudge}
              trackColor={{ true: palette.speaking, false: palette.border }}
            />
          </View>

          {/* Ducking Profile Picker */}
          <View style={[styles.duckingSelectorCard, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
            <View style={styles.menuLeft}>
              <Sliders size={16} color={palette.textSecondary} style={{ marginRight: 10 }} />
              <Text style={[styles.menuText, { color: palette.textPrimary }]}>Default Ducking Profile</Text>
            </View>
            <View style={styles.duckingOptionsRow}>
              {(Object.keys(DUCKING_PROFILES) as DuckingProfileType[]).map((prof) => {
                const isSelected = duckingProfile === prof;
                return (
                  <TouchableOpacity
                    key={prof}
                    style={[
                      styles.duckingOptionPill,
                      {
                        backgroundColor: isSelected ? palette.textPrimary : palette.background,
                        borderColor: isSelected ? palette.textPrimary : palette.border,
                      },
                    ]}
                    onPress={() => setDuckingProfile(prof)}
                  >
                    <Text
                      style={[
                        styles.duckingOptionText,
                        { color: isSelected ? "#FFFFFF" : palette.textSecondary },
                      ]}
                    >
                      {prof === "SING_TOGETHER" ? "Sing (40%)" : prof === "PODCAST_DJ" ? "DJ (20%)" : prof === "SUBTLE" ? "Subtle (65%)" : "Off"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Presence & Privacy Modes */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Social Presence & Privacy</Text>

          <View style={styles.privacyModesRow}>
            {[
              { id: "PUBLIC", label: "Public", desc: "Visible to anyone", icon: Eye },
              { id: "FRIENDS", label: "Friends Only", desc: "Mutuals only", icon: Shield },
              { id: "GHOST", label: "Ghost Mode", desc: "Hidden presence", icon: EyeOff },
            ].map((p) => {
              const isSelected = privacyMode === p.id;
              const IconComp = p.icon;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.privacyModeCard,
                    {
                      backgroundColor: isSelected ? palette.textPrimary : palette.surface,
                      borderColor: isSelected ? palette.textPrimary : palette.borderSubtle,
                    },
                  ]}
                  onPress={() => setPrivacyMode(p.id as PrivacyMode)}
                >
                  <IconComp size={16} color={isSelected ? "#FFFFFF" : palette.textPrimary} />
                  <Text
                    style={[
                      styles.privacyModeTitle,
                      { color: isSelected ? "#FFFFFF" : palette.textPrimary },
                    ]}
                  >
                    {p.label}
                  </Text>
                  <Text
                    style={[
                      styles.privacyModeDesc,
                      { color: isSelected ? "rgba(255,255,255,0.7)" : palette.textTertiary },
                    ]}
                  >
                    {p.desc}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <Modal visible={showEditModal} animationType="slide" transparent onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modalBox, { backgroundColor: palette.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: palette.textPrimary }]}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={20} color={palette.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalField}>
              <Text style={[styles.modalLabel, { color: palette.textSecondary }]}>DISPLAY NAME</Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                style={[
                  styles.modalInput,
                  { backgroundColor: palette.surface, borderColor: palette.border, color: palette.textPrimary },
                ]}
              />
            </View>

            <View style={styles.modalField}>
              <Text style={[styles.modalLabel, { color: palette.textSecondary }]}>BIO / MOOD</Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
                style={[
                  styles.modalTextarea,
                  { backgroundColor: palette.surface, borderColor: palette.border, color: palette.textPrimary },
                ]}
              />
            </View>

            <TouchableOpacity
              style={[styles.modalSaveBtn, { backgroundColor: palette.textPrimary }]}
              onPress={() => setShowEditModal(false)}
            >
              <Check size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.modalSaveText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: 110 },
  header: { marginTop: spacing.sm, marginBottom: spacing.lg },
  eyebrow: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  mainTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.tight,
  },
  profileCard: {
    alignItems: "center",
    padding: spacing.xl,
    borderRadius: radii.xl,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  avatarText: { color: "#FFF", fontSize: 28, fontWeight: "600" },
  name: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold },
  handle: { fontSize: typography.sizes.sm, marginTop: 2 },
  bio: { fontSize: typography.sizes.xs, textAlign: "center", marginTop: 8, paddingHorizontal: 16, lineHeight: 18 },
  editProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  editProfileText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  section: { marginTop: spacing.md },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.tight,
    marginBottom: spacing.sm,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 8,
  },
  statCard: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  statLabel: {
    fontSize: 9,
    marginTop: 2,
    textAlign: "center",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  menuSubtext: {
    fontSize: 10,
    marginTop: 2,
  },
  duckingSelectorCard: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 10,
    marginBottom: spacing.sm,
  },
  duckingOptionsRow: {
    flexDirection: "row",
    gap: 6,
  },
  duckingOptionPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    alignItems: "center",
  },
  duckingOptionText: {
    fontSize: 10,
    fontWeight: typography.weights.medium,
  },
  privacyModesRow: {
    flexDirection: "row",
    gap: 8,
  },
  privacyModeCard: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: "center",
    gap: 3,
  },
  privacyModeTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    marginTop: 2,
  },
  privacyModeDesc: {
    fontSize: 9,
    textAlign: "center",
  },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  modalBox: {
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: 14,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  modalField: {
    gap: 6,
  },
  modalLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.wider,
  },
  modalInput: {
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.sm,
  },
  modalTextarea: {
    height: 80,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    fontSize: typography.sizes.sm,
    textAlignVertical: "top",
  },
  modalSaveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 46,
    borderRadius: radii.full,
    marginTop: 4,
  },
  modalSaveText: {
    color: "#FFFFFF",
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
});
