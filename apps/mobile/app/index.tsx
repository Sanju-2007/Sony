import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  Headphones,
  Radio,
  Mic,
  Sparkles,
  Zap,
} from "lucide-react-native";
import { DotWaveBackground } from "../src/components/particles/DotWaveBackground";
import { usePlaybackStore } from "../src/store/playbackStore";

export default function EntryScreen() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("Alex Rivers");
  const { currentTrack } = usePlaybackStore();

  const handleEnter = () => {
    router.push("/(tabs)");
  };

  const handleQuickJoin = (roomId: string) => {
    router.push(`/room/${roomId}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Dynamic Antigravity Black Dots Wave Background */}
      <DotWaveBackground speed={1.0} density="dense" />

      {/* Top Navigation Minimal Bar */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Headphones size={15} color="#FFFFFF" strokeWidth={2.4} />
          </View>
          <Text style={styles.brandText}>SONY SOUNDSYNC</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.guestLink}
          onPress={() => router.push("/(tabs)")}
        >
          <Text style={styles.guestLinkText}>Skip to Home →</Text>
        </TouchableOpacity>
      </View>

      {/* Centered Glassmorphic Card */}
      <View style={styles.centerContainer}>
        <View style={styles.glassCard}>
          {/* Status Badge */}
          <View style={styles.statusBadge}>
            <View style={styles.statusPulse} />
            <Text style={styles.statusText}>15 LISTENING LIVE · 4 ROOMS</Text>
          </View>

          {/* Heading */}
          <Text style={styles.title}>Listen Together.</Text>
          <Text style={styles.subtitle}>
            Experience synchronized hi-res audio with your circle in real time.
            Zero lag, smart ducking, and spatial chat.
          </Text>

          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>DISPLAY NAME</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your name..."
                placeholderTextColor="#A1A1AA"
                style={styles.textInput}
              />
            </View>
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.primaryButton}
            onPress={handleEnter}
          >
            <Text style={styles.primaryButtonText}>Enter Social Lounge</Text>
            <ArrowRight size={17} color="#FFFFFF" strokeWidth={2.2} />
          </TouchableOpacity>

          {/* Secondary Live Room Shortcut */}
          <TouchableOpacity
            activeOpacity={0.82}
            style={styles.secondaryButton}
            onPress={() => handleQuickJoin("room-late-night-1")}
          >
            <Radio size={15} color="#0A0A0A" style={{ marginRight: 6 }} />
            <Text style={styles.secondaryButtonText}>
              Jump to "Late Night Family" ({currentTrack?.title || "Blinding Lights"})
            </Text>
          </TouchableOpacity>

          {/* Feature Chips */}
          <View style={styles.featuresRow}>
            <View style={styles.featureChip}>
              <Zap size={13} color="#0A0A0A" style={{ marginRight: 5 }} />
              <Text style={styles.featureChipText}>Sub-5ms Sync</Text>
            </View>
            <View style={styles.featureChip}>
              <Mic size={13} color="#0A0A0A" style={{ marginRight: 5 }} />
              <Text style={styles.featureChipText}>Auto Ducking</Text>
            </View>
            <View style={styles.featureChip}>
              <Sparkles size={13} color="#0A0A0A" style={{ marginRight: 5 }} />
              <Text style={styles.featureChipText}>Spatial Presence</Text>
            </View>
          </View>
        </View>

        {/* Subtle Footer */}
        <Text style={styles.footerNote}>
          Sony SoundSync · Pure Sound Engineering · Built for Modern Web & Mobile
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    position: "relative",
    overflow: "hidden",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 18,
    zIndex: 10,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: "#0A0A0A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  brandText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: "#0A0A0A",
  },
  guestLink: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
  guestLinkText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0A0A0A",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  glassCard: {
    width: "100%",
    maxWidth: 460,
    backgroundColor: "rgba(255, 255, 255, 0.82)",
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 36,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.06,
    shadowRadius: 36,
    ...Platform.select({
      web: {
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      },
    }),
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 18,
  },
  statusPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#059669",
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.8,
    color: "#0A0A0A",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: "#52525B",
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    color: "#71717A",
    marginBottom: 6,
  },
  inputWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.12)",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    justifyContent: "center",
  },
  textInput: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0A0A0A",
    // @ts-ignore
    outlineStyle: "none",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    backgroundColor: "#0A0A0A",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    marginRight: 8,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0A0A0A",
  },
  featuresRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.06)",
    paddingTop: 18,
  },
  featureChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  featureChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#18181B",
  },
  footerNote: {
    marginTop: 20,
    fontSize: 11,
    color: "#71717A",
    textAlign: "center",
  },
});
