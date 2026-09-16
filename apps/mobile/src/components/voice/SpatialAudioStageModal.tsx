import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  GestureResponderEvent,
} from "react-native";
import { X, Headphones, Radio, Volume2, Move, RotateCcw } from "lucide-react-native";
import { SpatialSeat } from "@sony/types";
import { SpatialAudioEngine } from "@sony/music-core";
import { colors, radii, spacing, typography } from "../../theme/tokens";
import { useRoomStore } from "../../store/roomStore";
import { socketService } from "../../services/socketService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const STAGE_SIZE = Math.min(SCREEN_WIDTH - 60, 300);
const STAGE_RADIUS = STAGE_SIZE / 2;

interface SpatialAudioStageModalProps {
  visible: boolean;
  onClose: () => void;
  roomId: string;
}

export const SpatialAudioStageModal: React.FC<SpatialAudioStageModalProps> = ({
  visible,
  onClose,
  roomId,
}) => {
  const palette = colors.dark;
  const { spatialSeats, updateUserSeat } = useRoomStore();

  const myUserId = "user-preview-1"; // Current listener id
  const mySeat = spatialSeats.find((s) => s.userId === myUserId) || {
    userId: myUserId,
    displayName: "Sanju (You)",
    x: 0,
    y: 45,
    pan: 0,
    distanceGain: 0.9,
  };

  const handleStageTouch = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    // Map from (0, STAGE_SIZE) to (-100, 100)
    const relX = Math.round(((locationX - STAGE_RADIUS) / STAGE_RADIUS) * 100);
    const relY = Math.round(((locationY - STAGE_RADIUS) / STAGE_RADIUS) * 100);

    // Clamp to circle radius 85
    const dist = Math.sqrt(relX * relX + relY * relY);
    const clampedDist = Math.min(dist, 85);
    const angle = Math.atan2(relY, relX);
    const x = Math.round(clampedDist * Math.cos(angle));
    const y = Math.round(clampedDist * Math.sin(angle));

    const { pan, distanceGain } = SpatialAudioEngine.calculateSpatialParameters(x, y);

    const updatedSeat: SpatialSeat = {
      ...mySeat,
      x,
      y,
      pan,
      distanceGain,
    };

    updateUserSeat(updatedSeat);
    socketService.updateSpatialPosition(roomId, updatedSeat);
  };

  const handleResetCenter = () => {
    const { pan, distanceGain } = SpatialAudioEngine.calculateSpatialParameters(0, 0);
    const resetSeat: SpatialSeat = {
      ...mySeat,
      x: 0,
      y: 0,
      pan,
      distanceGain,
    };
    updateUserSeat(resetSeat);
    socketService.updateSpatialPosition(roomId, resetSeat);
  };

  const formatPan = (pan: number) => {
    if (Math.abs(pan) < 0.08) return "Center (Balanced)";
    if (pan < 0) return `Left ${Math.round(Math.abs(pan) * 100)}%`;
    return `Right ${Math.round(pan * 100)}%`;
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheetContainer, { backgroundColor: palette.background }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleGroup}>
              <View style={[styles.iconBadge, { backgroundColor: "rgba(56, 189, 248, 0.15)" }]}>
                <Headphones size={20} color="#38BDF8" />
              </View>
              <View>
                <Text style={[styles.title, { color: palette.textPrimary }]}>2D Spatial Audio Stage</Text>
                <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
                  Binaural panning & distance acoustics
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={palette.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.stageHint, { color: palette.textTertiary }]}>
            Tap anywhere inside the circular soundstage to move your listening seat
          </Text>

          {/* Interactive Circular Soundstage */}
          <View style={styles.stageWrapper}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                styles.stageArena,
                { width: STAGE_SIZE, height: STAGE_SIZE, borderRadius: STAGE_RADIUS },
              ]}
              onPress={handleStageTouch}
            >
              {/* Concentric Acoustic Rings */}
              <View style={[styles.ring, { width: STAGE_SIZE * 0.75, height: STAGE_SIZE * 0.75, borderRadius: (STAGE_SIZE * 0.75) / 2 }]} />
              <View style={[styles.ring, { width: STAGE_SIZE * 0.45, height: STAGE_SIZE * 0.45, borderRadius: (STAGE_SIZE * 0.45) / 2 }]} />

              {/* Center DJ / Main Speaker Deck */}
              <View style={styles.centerDeck}>
                <Radio size={16} color="#38BDF8" />
                <Text style={styles.centerDeckText}>DECK</Text>
              </View>

              {/* Positioned Member Avatars */}
              {spatialSeats.map((seat) => {
                const isMe = seat.userId === myUserId;
                // Convert (-100, 100) to arena pixel coordinates
                const left = STAGE_RADIUS + (seat.x / 100) * STAGE_RADIUS - 16;
                const top = STAGE_RADIUS + (seat.y / 100) * STAGE_RADIUS - 16;

                return (
                  <View
                    key={seat.userId}
                    style={[
                      styles.avatarNode,
                      {
                        left,
                        top,
                        backgroundColor: isMe ? "#38BDF8" : "#374151",
                        borderColor: isMe ? "#FFFFFF" : "rgba(255, 255, 255, 0.3)",
                      },
                    ]}
                  >
                    <Text style={[styles.avatarInitial, { color: isMe ? "#09090B" : "#F3F4F6" }]}>
                      {seat.displayName.charAt(0)}
                    </Text>
                  </View>
                );
              })}
            </TouchableOpacity>
          </View>

          {/* Real-time Acoustics Readout */}
          <View style={[styles.readoutCard, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
            <View style={styles.readoutCol}>
              <Text style={[styles.readoutLabel, { color: palette.textTertiary }]}>STEREO PAN</Text>
              <Text style={[styles.readoutVal, { color: palette.textPrimary }]}>
                {formatPan(mySeat.pan)}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: palette.borderSubtle }]} />

            <View style={styles.readoutCol}>
              <Text style={[styles.readoutLabel, { color: palette.textTertiary }]}>PROXIMITY GAIN</Text>
              <Text style={[styles.readoutVal, { color: "#38BDF8" }]}>
                {Math.round(mySeat.distanceGain * 100)}% Loudness
              </Text>
            </View>
          </View>

          {/* Center Reset Action */}
          <TouchableOpacity style={styles.resetBtn} onPress={handleResetCenter} activeOpacity={0.8}>
            <RotateCcw size={14} color="#94A3B8" style={{ marginRight: 6 }} />
            <Text style={styles.resetBtnText}>Reset Seat to Sweet Spot (Center)</Text>
          </TouchableOpacity>
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
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.md,
    alignItems: "center",
  },
  headerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
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
  stageHint: {
    fontSize: 11,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  stageWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  stageArena: {
    backgroundColor: "#111827",
    borderColor: "rgba(56, 189, 248, 0.3)",
    borderWidth: 2,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  ring: {
    position: "absolute",
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderStyle: "dashed",
  },
  centerDeck: {
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    borderColor: "#38BDF8",
    borderWidth: 1.5,
  },
  centerDeckText: {
    color: "#38BDF8",
    fontSize: 8,
    fontWeight: typography.weights.bold,
    marginTop: 1,
  },
  avatarNode: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    zIndex: 10,
  },
  avatarInitial: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },
  readoutCard: {
    width: "100%",
    flexDirection: "row",
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  readoutCol: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: "80%",
    alignSelf: "center",
  },
  readoutLabel: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  readoutVal: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    marginBottom: spacing.md,
  },
  resetBtnText: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: typography.weights.medium,
  },
});
