import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { Mic, MicOff, Radio, Send, Trash2, Volume2 } from "lucide-react-native";
import { useThemeStore } from "../../store/themeStore";
import { usePlaybackStore } from "../../store/playbackStore";
import { spacing, radii } from "../../theme/tokens";

interface RoomVoiceControlBarProps {
  onSendVoiceMessage: (durationSec: number, waveform: number[]) => void;
  onOpenSingTogether: () => void;
  isSingTogetherActive: boolean;
  singTogetherCount: number;
}

export function RoomVoiceControlBar({
  onSendVoiceMessage,
  onOpenSingTogether,
  isSingTogetherActive,
  singTogetherCount,
}: RoomVoiceControlBarProps) {
  const { palette, isDark } = useThemeStore();
  const { isVoiceActive, setVoiceActive, volume } = usePlaybackStore();

  // WhatsApp Voice Note Recording State
  const [isRecordingVoiceNote, setIsRecordingVoiceNote] = useState(false);
  const [recordDurationSec, setRecordDurationSec] = useState(0);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Animation for red pulsing record indicator
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecordingVoiceNote) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: Platform.OS !== "web",
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: Platform.OS !== "web",
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecordingVoiceNote]);

  const startVoiceNoteRecording = () => {
    setIsRecordingVoiceNote(true);
    setRecordDurationSec(0);
    recordTimerRef.current = setInterval(() => {
      setRecordDurationSec((s) => s + 1);
    }, 1000);
  };

  const cancelVoiceNoteRecording = () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    setIsRecordingVoiceNote(false);
    setRecordDurationSec(0);
  };

  const finishAndSendVoiceNote = () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    const finalDuration = Math.max(1, recordDurationSec);
    setIsRecordingVoiceNote(false);
    setRecordDurationSec(0);

    // Generate realistic audio waveform bars
    const waveform = Array.from({ length: 14 }, () =>
      Number((Math.random() * 0.7 + 0.3).toFixed(2))
    );

    onSendVoiceMessage(finalDuration, waveform);
  };

  // Toggle Live Mic on stage
  const toggleLiveVoice = () => {
    setVoiceActive(!isVoiceActive);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <View style={styles.container}>
      {/* If actively recording WhatsApp voice note */}
      {isRecordingVoiceNote ? (
        <View
          style={[
            styles.recordingBar,
            { backgroundColor: palette.surface, borderColor: "#EF4444" },
          ]}
        >
          <View style={styles.recIndicator}>
            <Animated.View
              style={[styles.redDot, { opacity: pulseAnim }]}
            />
            <Text style={[styles.recTimerText, { color: "#EF4444" }]}>
              Recording {formatTimer(recordDurationSec)}
            </Text>
          </View>

          {/* Waveform graphic bars */}
          <View style={styles.waveformPreview}>
            {[4, 9, 14, 20, 15, 8, 17, 24, 12, 6, 18, 10].map((h, i) => (
              <View
                key={i}
                style={[
                  styles.waveBar,
                  {
                    height: h,
                    backgroundColor: i % 2 === 0 ? "#EF4444" : "rgba(239, 68, 68, 0.4)",
                  },
                ]}
              />
            ))}
          </View>

          {/* Cancel button */}
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={cancelVoiceNoteRecording}
          >
            <Trash2 size={16} color={palette.textTertiary} />
          </TouchableOpacity>

          {/* Send voice note button */}
          <TouchableOpacity
            style={styles.sendVoiceBtn}
            onPress={finishAndSendVoiceNote}
          >
            <Send size={15} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        /* DUAL OPTIONS: Option 1: Sing Together | Option 2: Voice Chat */
        <View style={styles.dualBarRow}>
          {/* OPTION 1: SING TOGETHER */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.optionCard,
              {
                backgroundColor: isSingTogetherActive
                  ? "rgba(139, 92, 246, 0.14)"
                  : palette.surface,
                borderColor: isSingTogetherActive ? "#8B5CF6" : palette.border,
              },
            ]}
            onPress={onOpenSingTogether}
          >
            <View
              style={[
                styles.optionIconCircle,
                {
                  backgroundColor: isSingTogetherActive
                    ? "#8B5CF6"
                    : "rgba(139, 92, 246, 0.12)",
                },
              ]}
            >
              <Mic
                size={16}
                color={isSingTogetherActive ? "#FFFFFF" : "#8B5CF6"}
              />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionTitle, { color: palette.textPrimary }]}>
                Sing Together
              </Text>
              <Text style={[styles.optionSubtitle, { color: palette.textTertiary }]} numberOfLines={1}>
                {isSingTogetherActive
                  ? `Active · ${singTogetherCount} in chorus`
                  : "Send request to room"}
              </Text>
            </View>
          </TouchableOpacity>

          {/* OPTION 2: VOICE CHAT */}
          <View
            style={[
              styles.optionCard,
              {
                backgroundColor: isVoiceActive
                  ? "rgba(16, 185, 129, 0.14)"
                  : palette.surface,
                borderColor: isVoiceActive ? "#10B981" : palette.border,
              },
            ]}
          >
            {/* Live Mic Toggle */}
            <TouchableOpacity
              activeOpacity={0.75}
              style={[
                styles.optionIconCircle,
                {
                  backgroundColor: isVoiceActive
                    ? "#10B981"
                    : "rgba(16, 185, 129, 0.12)",
                },
              ]}
              onPress={toggleLiveVoice}
            >
              {isVoiceActive ? (
                <Mic size={16} color="#FFFFFF" />
              ) : (
                <MicOff size={16} color={palette.textSecondary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionTextContainer}
              onPress={toggleLiveVoice}
            >
              <Text style={[styles.optionTitle, { color: palette.textPrimary }]}>
                Voice Chat
              </Text>
              <Text style={[styles.optionSubtitle, { color: palette.textTertiary }]} numberOfLines={1}>
                {isVoiceActive ? "Live Mic · Ducking active" : "Tap for Live · Hold 🎙 for msg"}
              </Text>
            </TouchableOpacity>

            {/* WhatsApp Hold-to-Record Mic Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.recordAudioBtn,
                {
                  backgroundColor: palette.background,
                  borderColor: palette.borderSubtle,
                },
              ]}
              onPressIn={startVoiceNoteRecording}
              onPressOut={finishAndSendVoiceNote}
            >
              <Mic size={15} color="#10B981" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    maxWidth: 880,
    width: "100%",
    alignSelf: "center",
  },
  dualBarRow: {
    flexDirection: "row",
    gap: 10,
  },
  optionCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  optionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  optionSubtitle: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: "500",
  },
  recordAudioBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  recordingBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    justifyContent: "space-between",
  },
  recIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EF4444",
    marginRight: 8,
  },
  recTimerText: {
    fontSize: 13,
    fontWeight: "700",
  },
  waveformPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    height: 24,
  },
  waveBar: {
    width: 3,
    borderRadius: 1.5,
  },
  cancelBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  sendVoiceBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
});
