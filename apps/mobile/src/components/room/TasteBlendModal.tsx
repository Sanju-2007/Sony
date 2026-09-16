import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Sparkles, X, Check, Music, User, Layers, Plus } from "lucide-react-native";
import { colors, spacing, typography, radii } from "../../theme/tokens";
import { usePlaybackStore } from "../../store/playbackStore";
import { MusicTasteBlendEngine } from "@sony/music-core";
import { TasteProfile, TrackMetadata } from "@sony/types";

interface TasteBlendModalProps {
  visible: boolean;
  onClose: () => void;
  roomTitle: string;
}

const CURRENT_USER_PROFILE: TasteProfile = {
  userId: "user-1",
  displayName: "Sanju (You)",
  topGenres: ["Synthwave", "R&B", "Indie Pop", "Electronic", "Lo-Fi"],
  topArtists: ["The Weeknd", "Daft Punk", "Kavinsky", "Chvrches"],
  acousticTendency: 45,
  energyPreference: 80,
  tempoBpmAvg: 120,
};

const ROOM_PARTICIPANTS: TasteProfile[] = [
  {
    userId: "user-2",
    displayName: "Aisha",
    topGenres: ["Synthwave", "Electronic", "R&B", "Cyberpunk", "Chillwave"],
    topArtists: ["The Weeknd", "Daft Punk", "Gunship", "M83"],
    acousticTendency: 40,
    energyPreference: 85,
    tempoBpmAvg: 124,
  },
  {
    userId: "user-3",
    displayName: "Rahul",
    topGenres: ["Lo-Fi", "Indie Pop", "Ambient", "Acoustic", "Jazz Hop"],
    topArtists: ["Kaito & Maya", "Nujabes", "Tom Misch", "FKJ"],
    acousticTendency: 75,
    energyPreference: 45,
    tempoBpmAvg: 95,
  },
  {
    userId: "user-4",
    displayName: "Elena",
    topGenres: ["Deep House", "Indie Pop", "Electronic", "Synthwave", "Techno"],
    topArtists: ["Disclosure", "Bicep", "Chvrches", "Peggy Gou"],
    acousticTendency: 30,
    energyPreference: 90,
    tempoBpmAvg: 126,
  },
];

const SAMPLE_CATALOG: TrackMetadata[] = [
  {
    id: "track-blend-1",
    provider: "LICENSED_CATALOG",
    providerTrackId: "track-b1",
    title: "Midnight City Lights",
    artist: "Daft Punk & The Weeknd",
    album: "Neon Echoes",
    artworkUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&fit=crop&q=80",
    durationMs: 215000,
    genre: "Synthwave",
  },
  {
    id: "track-blend-2",
    provider: "LICENSED_CATALOG",
    providerTrackId: "track-b2",
    title: "After Hours Resonance",
    artist: "The Weeknd",
    album: "After Hours",
    artworkUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80",
    durationMs: 198000,
    genre: "R&B",
  },
  {
    id: "track-blend-3",
    provider: "LICENSED_CATALOG",
    providerTrackId: "track-b3",
    title: "Cyber Starlight",
    artist: "Kavinsky & Aisha",
    album: "Nightride Odyssey",
    artworkUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&fit=crop&q=80",
    durationMs: 230000,
    genre: "Electronic",
  },
  {
    id: "track-blend-4",
    provider: "LICENSED_CATALOG",
    providerTrackId: "track-b4",
    title: "Shibuya Rain Memories",
    artist: "Kaito & Maya",
    album: "Lo-Fi Nights",
    artworkUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&fit=crop&q=80",
    durationMs: 185000,
    genre: "Lo-Fi",
  },
  {
    id: "track-blend-5",
    provider: "LICENSED_CATALOG",
    providerTrackId: "track-b5",
    title: "Prismatic Horizon",
    artist: "Chvrches",
    album: "Screen Violence",
    artworkUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&fit=crop&q=80",
    durationMs: 204000,
    genre: "Indie Pop",
  },
];

export const TasteBlendModal: React.FC<TasteBlendModalProps> = ({
  visible,
  onClose,
  roomTitle,
}) => {
  const palette = colors.dark;
  const { addToQueue } = usePlaybackStore();
  const [selectedPartner, setSelectedPartner] = useState<TasteProfile>(ROOM_PARTICIPANTS[0]);
  const [blendQueued, setBlendQueued] = useState(false);

  const blendResult = useMemo(() => {
    const res = MusicTasteBlendEngine.calculateCompatibility(
      CURRENT_USER_PROFILE,
      selectedPartner
    );
    res.suggestedBlendTracks = MusicTasteBlendEngine.generateBlendQueue(
      CURRENT_USER_PROFILE,
      selectedPartner,
      SAMPLE_CATALOG
    );
    return res;
  }, [selectedPartner]);

  const handleInjectBlend = () => {
    blendResult.suggestedBlendTracks.forEach((track) => {
      addToQueue(track, {
        id: "blend-system",
        username: "party-blend",
        displayName: `Blend (${CURRENT_USER_PROFILE.displayName.split(" ")[0]} + ${selectedPartner.displayName})`,
      });
    });
    setBlendQueued(true);
    setTimeout(() => {
      setBlendQueued(false);
    }, 2500);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheetContainer, { backgroundColor: palette.background }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleGroup}>
              <View style={[styles.iconBadge, { backgroundColor: "rgba(245, 158, 11, 0.15)" }]}>
                <Sparkles size={18} color="#F59E0B" />
              </View>
              <View>
                <Text style={[styles.title, { color: palette.textPrimary }]}>Party Taste Blend</Text>
                <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
                  Acoustic compatibility & collaborative queues
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityLabel="Close Taste Blend Modal"
            >
              <X size={20} color={palette.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Listener Selector */}
            <Text style={[styles.sectionLabel, { color: palette.textTertiary }]}>COMPARE TASTE WITH ROOM MEMBER</Text>
            <View style={styles.partnerRow}>
              {ROOM_PARTICIPANTS.map((partner) => {
                const isSelected = selectedPartner.userId === partner.userId;
                return (
                  <TouchableOpacity
                    key={partner.userId}
                    style={[
                      styles.partnerChip,
                      { backgroundColor: palette.surface, borderColor: palette.borderSubtle },
                      isSelected && { borderColor: palette.accent, backgroundColor: palette.surfaceHover },
                    ]}
                    onPress={() => {
                      setSelectedPartner(partner);
                      setBlendQueued(false);
                    }}
                  >
                    <View style={[styles.partnerAvatar, { backgroundColor: palette.card }]}>
                      <Text style={[styles.partnerAvatarText, { color: palette.textPrimary }]}>
                        {partner.displayName.charAt(0)}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.partnerName,
                        { color: palette.textSecondary },
                        isSelected && { color: palette.textPrimary, fontWeight: typography.weights.semibold },
                      ]}
                    >
                      {partner.displayName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Match Radar Card */}
            <View style={[styles.scoreCard, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
              <View style={styles.scoreTopRow}>
                <View>
                  <Text style={[styles.scoreSubtitle, { color: palette.textSecondary }]}>
                    {CURRENT_USER_PROFILE.displayName.split(" ")[0]} × {selectedPartner.displayName}
                  </Text>
                  <Text style={[styles.scoreVerdict, { color: palette.textPrimary }]}>{blendResult.verdict}</Text>
                </View>
                <View style={[styles.scoreGaugeCircle, { borderColor: palette.accent }]}>
                  <Text style={[styles.scorePercent, { color: palette.textPrimary }]}>
                    {blendResult.compatibilityScore}%
                  </Text>
                  <Text style={[styles.scoreMatchLabel, { color: palette.textTertiary }]}>MATCH</Text>
                </View>
              </View>

              {/* Dimensional Breakdown */}
              <View style={styles.dimensionsContainer}>
                {/* Genre Affinity */}
                <View style={styles.dimensionRow}>
                  <View style={styles.dimensionMeta}>
                    <Text style={[styles.dimensionLabel, { color: palette.textSecondary }]}>Genre Affinity</Text>
                    <Text style={[styles.dimensionVal, { color: palette.textPrimary }]}>
                      {blendResult.breakdown.genreAffinity}%
                    </Text>
                  </View>
                  <View style={[styles.dimTrack, { backgroundColor: palette.borderSubtle }]}>
                    <View
                      style={[
                        styles.dimFill,
                        { width: `${blendResult.breakdown.genreAffinity}%`, backgroundColor: palette.accent },
                      ]}
                    />
                  </View>
                </View>

                {/* Tempo Harmony */}
                <View style={styles.dimensionRow}>
                  <View style={styles.dimensionMeta}>
                    <Text style={[styles.dimensionLabel, { color: palette.textSecondary }]}>Tempo Harmony</Text>
                    <Text style={[styles.dimensionVal, { color: palette.textPrimary }]}>
                      {blendResult.breakdown.tempoHarmony}%
                    </Text>
                  </View>
                  <View style={[styles.dimTrack, { backgroundColor: palette.borderSubtle }]}>
                    <View
                      style={[
                        styles.dimFill,
                        { width: `${blendResult.breakdown.tempoHarmony}%`, backgroundColor: "#60A5FA" },
                      ]}
                    />
                  </View>
                </View>

                {/* Energy Balance */}
                <View style={styles.dimensionRow}>
                  <View style={styles.dimensionMeta}>
                    <Text style={[styles.dimensionLabel, { color: palette.textSecondary }]}>Energy Synergy</Text>
                    <Text style={[styles.dimensionVal, { color: palette.textPrimary }]}>
                      {blendResult.breakdown.energyBalance}%
                    </Text>
                  </View>
                  <View style={[styles.dimTrack, { backgroundColor: palette.borderSubtle }]}>
                    <View
                      style={[
                        styles.dimFill,
                        { width: `${blendResult.breakdown.energyBalance}%`, backgroundColor: "#F59E0B" },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Shared Genres & Artists */}
            <View style={styles.sharedSection}>
              <Text style={[styles.sectionLabel, { color: palette.textTertiary }]}>SHARED GENRES</Text>
              <View style={styles.pillContainer}>
                {blendResult.sharedGenres.length > 0 ? (
                  blendResult.sharedGenres.map((g) => (
                    <View key={g} style={[styles.sharedPill, { backgroundColor: palette.card, borderColor: palette.borderSubtle }]}>
                      <Music size={11} color={palette.textPrimary} />
                      <Text style={[styles.sharedPillText, { color: palette.textPrimary }]}>{g}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.emptyNote, { color: palette.textTertiary }]}>Diverse eclectic genres</Text>
                )}
              </View>

              <Text style={[styles.sectionLabel, { marginTop: spacing.md, color: palette.textTertiary }]}>
                MUTUAL ARTISTS IN COMMON
              </Text>
              <View style={styles.pillContainer}>
                {blendResult.sharedArtists.length > 0 ? (
                  blendResult.sharedArtists.map((a) => (
                    <View key={a} style={[styles.sharedPill, { backgroundColor: "rgba(16, 185, 129, 0.08)", borderColor: "rgba(16, 185, 129, 0.2)" }]}>
                      <User size={11} color="#A7F3D0" />
                      <Text style={[styles.sharedPillText, { color: "#A7F3D0" }]}>
                        {a}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.emptyNote, { color: palette.textTertiary }]}>Complimentary artist catalogs</Text>
                )}
              </View>
            </View>

            {/* Curated 5-Song Blend Preview */}
            <Text style={[styles.sectionLabel, { marginTop: spacing.md, color: palette.textTertiary }]}>
              COLLABORATIVE 5-TRACK BLEND
            </Text>
            {blendResult.suggestedBlendTracks.map((track, idx) => (
              <View key={track.id} style={[styles.trackCard, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
                <Text style={[styles.trackIdx, { color: palette.textTertiary }]}>0{idx + 1}</Text>
                <View style={styles.trackInfo}>
                  <Text style={[styles.trackTitle, { color: palette.textPrimary }]} numberOfLines={1}>
                    {track.title}
                  </Text>
                  <Text style={[styles.trackArtist, { color: palette.textSecondary }]} numberOfLines={1}>
                    {track.artist} • {track.genre}
                  </Text>
                </View>
                <Plus size={16} color={palette.textTertiary} />
              </View>
            ))}

            {/* Inject into Live Room Queue Button */}
            <TouchableOpacity
              style={[
                styles.injectButton,
                { backgroundColor: palette.accent },
                blendQueued && { backgroundColor: "rgba(16, 185, 129, 0.15)", borderWidth: 1, borderColor: "#10B981" },
              ]}
              onPress={handleInjectBlend}
              activeOpacity={0.8}
            >
              {blendQueued ? (
                <Check size={18} color="#10B981" />
              ) : (
                <Layers size={18} color={palette.background} />
              )}
              <Text
                style={[
                  styles.injectButtonText,
                  { color: palette.background },
                  blendQueued && { color: "#10B981" },
                ]}
              >
                {blendQueued
                  ? "5 Blend Tracks Injected! 🎶"
                  : "Inject 5-Song Blend into Room Queue"}
              </Text>
            </TouchableOpacity>

            <View style={{ height: 28 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.78)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    maxHeight: "88%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  closeButton: {
    padding: spacing.xs,
  },
  scrollArea: {
    marginTop: spacing.xs,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.1,
    marginBottom: spacing.xs,
  },
  partnerRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  partnerChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
  },
  partnerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  partnerAvatarText: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },
  partnerName: {
    fontSize: 12,
    fontWeight: typography.weights.medium,
  },
  scoreCard: {
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  scoreTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  scoreSubtitle: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
  },
  scoreVerdict: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginTop: 2,
  },
  scoreGaugeCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  scorePercent: {
    fontSize: 16,
    fontWeight: typography.weights.bold,
  },
  scoreMatchLabel: {
    fontSize: 8,
    letterSpacing: 0.8,
  },
  dimensionsContainer: {
    gap: spacing.sm,
  },
  dimensionRow: {
    gap: 4,
  },
  dimensionMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dimensionLabel: {
    fontSize: 11,
  },
  dimensionVal: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
  },
  dimTrack: {
    height: 4,
    borderRadius: radii.full,
    overflow: "hidden",
  },
  dimFill: {
    height: "100%",
  },
  sharedSection: {
    marginBottom: spacing.sm,
  },
  pillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  sharedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
  },
  sharedPillText: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
  },
  emptyNote: {
    fontSize: 11,
    fontStyle: "italic",
  },
  trackCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderWidth: 1,
  },
  trackIdx: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    width: 24,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 12,
    fontWeight: typography.weights.semibold,
  },
  trackArtist: {
    fontSize: 10,
    marginTop: 1,
  },
  injectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    marginTop: spacing.md,
  },
  injectButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
});
