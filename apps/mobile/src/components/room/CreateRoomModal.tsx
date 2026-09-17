import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { X, Globe, Users, Lock, Sparkles, Music, ChevronRight } from "lucide-react-native";
import { RoomType, TrackMetadata } from "@sony/types";
import { typography, spacing, radii } from "../../theme/tokens";
import { usePlaybackStore } from "../../store/playbackStore";
import { useRoomStore } from "../../store/roomStore";
import { useThemeStore } from "../../store/themeStore";
import { CATALOG_TRACKS, MusicSearchModal } from "../music/MusicSearchModal";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface CreateRoomModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated?: (roomId: string) => void;
}

export function CreateRoomModal({ visible, onClose, onCreated }: CreateRoomModalProps) {
  const router = useRouter();
  const { palette, isDark } = useThemeStore();

  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [privacy, setPrivacy] = useState<RoomType>("PUBLIC");
  const [selectedTrack, setSelectedTrack] = useState<TrackMetadata>(CATALOG_TRACKS[0]);
  const [showTrackPicker, setShowTrackPicker] = useState(false);
  const [maxParticipants, setMaxParticipants] = useState(25);

  const { playTrackImmediate } = usePlaybackStore();
  const { setRoom } = useRoomStore();

  const handleCreate = () => {
    const finalName = name.trim() || "Midnight Chill Session";
    const finalTopic = topic.trim() || "Ambient soundscapes and good conversations";
    const roomId = "room-" + Date.now().toString(36);

    // Initialize room store state
    setRoom(
      {
        id: roomId,
        name: finalName,
        slug: finalName.toLowerCase().replace(/\s+/g, "-"),
        description: finalTopic,
        type: privacy,
        ownerId: "user-preview-1",
        maxParticipants,
        participantCount: 1,
        status: "ACTIVE",
        currentTrack: selectedTrack,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      [
        {
          userId: "user-preview-1",
          roomId,
          role: "HOST",
          isMuted: false,
          isDeafened: false,
          isSpeaking: false,
          joinedAt: new Date().toISOString(),
          user: { id: "user-preview-1", username: "sanju", displayName: "Sanju" },
        },
      ]
    );

    // Play initial track
    playTrackImmediate(selectedTrack);

    onClose();
    if (onCreated) {
      onCreated(roomId);
    } else {
      router.push("/room/" + roomId);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheetContainer, { backgroundColor: palette.background }]}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={[styles.handleBar, { backgroundColor: palette.border }]} />
            <View style={styles.titleRow}>
              <View style={styles.titleWithIcon}>
                <Sparkles size={18} color={palette.textPrimary} style={{ marginRight: 6 }} />
                <Text style={[styles.sheetTitle, { color: palette.textPrimary }]}>Create Listening Room</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <X size={20} color={palette.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
            {/* Room Name */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>ROOM NAME</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Late Night Synthwave & Deep Code"
                placeholderTextColor={palette.textTertiary}
                style={[
                  styles.input,
                  { backgroundColor: palette.surface, borderColor: palette.border, color: palette.textPrimary },
                ]}
              />
            </View>

            {/* Room Vibe / Topic */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>VIBE / TOPIC</Text>
              <TextInput
                value={topic}
                onChangeText={setTopic}
                placeholder="e.g. Chill ambient beats, working late together"
                placeholderTextColor={palette.textTertiary}
                style={[
                  styles.input,
                  { backgroundColor: palette.surface, borderColor: palette.border, color: palette.textPrimary },
                ]}
              />
            </View>

            {/* Privacy Selection */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>ROOM PRIVACY</Text>
              <View style={styles.privacyRow}>
                <TouchableOpacity
                  style={[
                    styles.privacyCard,
                    {
                      backgroundColor: privacy === "PUBLIC" ? palette.accent : palette.surface,
                      borderColor: privacy === "PUBLIC" ? palette.accent : palette.borderSubtle,
                    },
                  ]}
                  onPress={() => setPrivacy("PUBLIC")}
                >
                  <Globe size={18} color={privacy === "PUBLIC" ? palette.accentInverted : palette.textPrimary} />
                  <Text
                    style={[
                      styles.privacyTitle,
                      { color: privacy === "PUBLIC" ? palette.accentInverted : palette.textPrimary },
                    ]}
                  >
                    Public
                  </Text>
                  <Text
                    style={[
                      styles.privacySubtitle,
                      { color: privacy === "PUBLIC" ? (isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)") : palette.textTertiary },
                    ]}
                  >
                    Anyone can join
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.privacyCard,
                    {
                      backgroundColor: privacy === "PRIVATE" ? palette.accent : palette.surface,
                      borderColor: privacy === "PRIVATE" ? palette.accent : palette.borderSubtle,
                    },
                  ]}
                  onPress={() => setPrivacy("PRIVATE")}
                >
                  <Lock size={18} color={privacy === "PRIVATE" ? palette.accentInverted : palette.textPrimary} />
                  <Text
                    style={[
                      styles.privacyTitle,
                      { color: privacy === "PRIVATE" ? palette.accentInverted : palette.textPrimary },
                    ]}
                  >
                    Private
                  </Text>
                  <Text
                    style={[
                      styles.privacySubtitle,
                      { color: privacy === "PRIVATE" ? (isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)") : palette.textTertiary },
                    ]}
                  >
                    Invite code only
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Starting Track Picker */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>STARTING MUSIC TRACK</Text>
              <TouchableOpacity
                style={[
                  styles.trackPickerCard,
                  { backgroundColor: palette.surface, borderColor: palette.borderSubtle },
                ]}
                onPress={() => setShowTrackPicker(true)}
              >
                <Image source={{ uri: selectedTrack.artworkUrl }} style={styles.trackThumb} />
                <View style={styles.trackInfo}>
                  <Text style={[styles.pickerTrackTitle, { color: palette.textPrimary }]} numberOfLines={1}>
                    {selectedTrack.title}
                  </Text>
                  <Text style={[styles.pickerTrackArtist, { color: palette.textSecondary }]} numberOfLines={1}>
                    {selectedTrack.artist} · {selectedTrack.provider}
                  </Text>
                </View>
                <ChevronRight size={18} color={palette.textTertiary} />
              </TouchableOpacity>
            </View>

            {/* Max Capacity Pills */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>MAX PARTICIPANTS</Text>
              <View style={styles.capacityRow}>
                {[10, 25, 50, 100].map((cap) => {
                  const isSelected = maxParticipants === cap;
                  return (
                    <TouchableOpacity
                      key={cap}
                      style={[
                        styles.capacityPill,
                        {
                          backgroundColor: isSelected ? palette.accent : palette.surface,
                          borderColor: isSelected ? palette.accent : palette.borderSubtle,
                        },
                      ]}
                      onPress={() => setMaxParticipants(cap)}
                    >
                      <Text
                        style={[
                          styles.capacityText,
                          { color: isSelected ? palette.accentInverted : palette.textPrimary },
                        ]}
                      >
                        {cap} seats
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Submit Action Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.createBtn, { backgroundColor: palette.accent }]}
              onPress={handleCreate}
            >
              <Sparkles size={18} color={palette.accentInverted} style={{ marginRight: 8 }} />
              <Text style={[styles.createBtnText, { color: palette.accentInverted }]}>Create & Enter Room</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Nested Track Picker */}
          <MusicSearchModal
            visible={showTrackPicker}
            onClose={() => setShowTrackPicker(false)}
            onSelectTrack={(track) => setSelectedTrack(track)}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    height: SCREEN_HEIGHT * 0.88,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: 30,
  },
  sheetHeader: {
    alignItems: "center",
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  titleWithIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  sheetTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.tight,
  },
  closeBtn: {
    padding: 6,
  },
  formContent: {
    paddingTop: spacing.sm,
    paddingBottom: 24,
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.wider,
  },
  input: {
    height: 46,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.sm,
  },
  privacyRow: {
    flexDirection: "row",
    gap: 12,
  },
  privacyCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  privacyTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  privacySubtitle: {
    fontSize: 11,
  },
  trackPickerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  trackThumb: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
  },
  trackInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  pickerTrackTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  pickerTrackArtist: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  capacityRow: {
    flexDirection: "row",
    gap: 8,
  },
  capacityPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.full,
    borderWidth: 1,
    alignItems: "center",
  },
  capacityText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  createBtn: {
    height: 52,
    borderRadius: radii.full,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  createBtnText: {
    color: "#FFFFFF",
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.tight,
  },
});
