import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import { X, Sparkles, Volume2, Radio, Check, Disc3, Mic } from "lucide-react-native";
import { AIDJPersona, TrackMetadata } from "@sony/types";
import { AIDJ_PERSONAS, AIDJEngine } from "@sony/music-core";
import { colors, radii, spacing, typography } from "../../theme/tokens";
import { useRoomStore } from "../../store/roomStore";
import { socketService } from "../../services/socketService";

interface AIDJSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  roomId: string;
  currentTrack?: TrackMetadata | null;
}

export const AIDJSettingsModal: React.FC<AIDJSettingsModalProps> = ({
  visible,
  onClose,
  roomId,
  currentTrack,
}) => {
  const palette = colors.dark;
  const { aiDJConfig, setAIDJConfig, setActiveAnnouncement } = useRoomStore();

  const handlePersonaSelect = (persona: AIDJPersona) => {
    setAIDJConfig({ persona });
  };

  const handleTestDrop = () => {
    const nextTrackSample: TrackMetadata = {
      id: "track-next-demo",
      provider: "LICENSED_CATALOG",
      providerTrackId: "demo-01",
      title: "Starboy",
      artist: "The Weeknd ft. Daft Punk",
      album: "Starboy",
      artworkUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&fit=crop&q=80",
      durationMs: 230000,
      genre: "Electro-Pop",
    };

    const announcement = AIDJEngine.generateTransitionAnnouncement({
      roomId,
      currentTrack: currentTrack || undefined,
      nextTrack: nextTrackSample,
      addedBy: "Aisha",
      persona: aiDJConfig.persona,
    });

    setActiveAnnouncement(announcement);
    socketService.sendDJCommentary(roomId, announcement);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheetContainer, { backgroundColor: palette.background }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleGroup}>
              <View style={[styles.iconBadge, { backgroundColor: "rgba(139, 92, 246, 0.15)" }]}>
                <Radio size={18} color="#A78BFA" />
              </View>
              <View>
                <Text style={[styles.title, { color: palette.textPrimary }]}>Sony AI DJ Co-Pilot</Text>
                <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
                  Contextual commentary & smart queue flow
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={palette.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Master Toggle */}
            <View style={[styles.switchCard, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
              <View style={styles.switchInfo}>
                <Text style={[styles.switchTitle, { color: palette.textPrimary }]}>Enable AI DJ Engine</Text>
                <Text style={[styles.switchDesc, { color: palette.textTertiary }]}>
                  Broadcast spoken commentary and manage queue flow
                </Text>
              </View>
              <Switch
                value={aiDJConfig.enabled}
                onValueChange={(val) => setAIDJConfig({ enabled: val })}
                thumbColor={aiDJConfig.enabled ? "#A78BFA" : "#6B7280"}
                trackColor={{ false: "#374151", true: "rgba(139, 92, 246, 0.5)" }}
              />
            </View>

            {/* Persona Selection */}
            <Text style={[styles.sectionTitle, { color: palette.textTertiary }]}>DJ HOST PERSONA</Text>
            <View style={styles.personaList}>
              {(Object.keys(AIDJ_PERSONAS) as AIDJPersona[]).map((pKey) => {
                const persona = AIDJ_PERSONAS[pKey];
                const isSelected = aiDJConfig.persona === pKey;
                return (
                  <TouchableOpacity
                    key={pKey}
                    style={[
                      styles.personaCard,
                      {
                        backgroundColor: isSelected ? "rgba(139, 92, 246, 0.12)" : palette.surface,
                        borderColor: isSelected ? "#8B5CF6" : palette.borderSubtle,
                      },
                    ]}
                    onPress={() => handlePersonaSelect(pKey)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.personaEmoji}>{persona.avatarEmoji}</Text>
                    <View style={styles.personaDetails}>
                      <View style={styles.personaHeader}>
                        <Text style={[styles.personaName, { color: isSelected ? "#A78BFA" : palette.textPrimary }]}>
                          {persona.name}
                        </Text>
                        {isSelected && <Check size={16} color="#A78BFA" />}
                      </View>
                      <Text style={[styles.personaTagline, { color: palette.textSecondary }]}>
                        {persona.tagline}
                      </Text>
                      <Text style={[styles.personaQuote, { color: palette.textTertiary }]}>
                        "{persona.samplePhrase}"
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Feature Options */}
            <Text style={[styles.sectionTitle, { color: palette.textTertiary }]}>AUTOMATION RULES</Text>

            <View style={[styles.settingRow, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
              <View style={styles.switchInfo}>
                <Text style={[styles.switchTitle, { color: palette.textPrimary }]}>Smart Queue Auto-Fill</Text>
                <Text style={[styles.switchDesc, { color: palette.textTertiary }]}>
                  Automatically queue matching tracks when queue reaches zero
                </Text>
              </View>
              <Switch
                value={aiDJConfig.autoQueueReplenish}
                onValueChange={(val) => setAIDJConfig({ autoQueueReplenish: val })}
                thumbColor={aiDJConfig.autoQueueReplenish ? "#A78BFA" : "#6B7280"}
                trackColor={{ false: "#374151", true: "rgba(139, 92, 246, 0.5)" }}
              />
            </View>

            <View style={[styles.settingRow, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
              <View style={styles.switchInfo}>
                <Text style={[styles.switchTitle, { color: palette.textPrimary }]}>Transition Commentary</Text>
                <Text style={[styles.switchDesc, { color: palette.textTertiary }]}>
                  Show dynamic song introductions between track changes
                </Text>
              </View>
              <Switch
                value={aiDJConfig.voiceCommentary}
                onValueChange={(val) => setAIDJConfig({ voiceCommentary: val })}
                thumbColor={aiDJConfig.voiceCommentary ? "#A78BFA" : "#6B7280"}
                trackColor={{ false: "#374151", true: "rgba(139, 92, 246, 0.5)" }}
              />
            </View>

            {/* Test Trigger Button */}
            <TouchableOpacity style={styles.testBtn} onPress={handleTestDrop} activeOpacity={0.8}>
              <Sparkles size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.testBtnText}>Simulate Live DJ Drop Now</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    maxHeight: "88%",
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  scrollContent: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.8,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  switchCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.xs,
  },
  switchInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  switchTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  switchDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  personaList: {
    gap: spacing.xs,
  },
  personaCard: {
    flexDirection: "row",
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1.5,
    gap: spacing.sm,
  },
  personaEmoji: {
    fontSize: 28,
  },
  personaDetails: {
    flex: 1,
  },
  personaHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  personaName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  personaTagline: {
    fontSize: 11,
    marginTop: 2,
  },
  personaQuote: {
    fontSize: 10,
    fontStyle: "italic",
    marginTop: 4,
  },
  testBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8B5CF6",
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  testBtnText: {
    color: "#FFFFFF",
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
});
