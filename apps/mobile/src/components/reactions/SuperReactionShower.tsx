import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { SuperReactionPayload, SuperReactionType } from "@sony/types";
import { colors, radii, typography, spacing } from "../../theme/tokens";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface SuperReactionShowerProps {
  activeSuperReaction: SuperReactionPayload | null;
  onFinish: () => void;
}

const SUPER_REACTION_META: Record<
  SuperReactionType,
  { label: string; emojis: string[]; color: string; bg: string }
> = {
  GOLDEN_VINYL: {
    label: "Golden Vinyl Burst",
    emojis: ["📀", "✨", "🌟", "💫"],
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.2)",
  },
  DISCO_BLAST: {
    label: "Disco Ball Explosion",
    emojis: ["🪩", "✨", "🔮", "🎵"],
    color: "#A855F7",
    bg: "rgba(168, 85, 247, 0.2)",
  },
  HEART_BURST: {
    label: "Cosmic Heart Shower",
    emojis: ["💖", "💕", "❤️", "🌸"],
    color: "#EC4899",
    bg: "rgba(236, 72, 153, 0.2)",
  },
  FLAME_SURGE: {
    label: "Hype Flame Surge",
    emojis: ["🔥", "⚡", "💥", "🚀"],
    color: "#EF4444",
    bg: "rgba(239, 68, 68, 0.2)",
  },
};

export const SuperReactionShower: React.FC<SuperReactionShowerProps> = ({
  activeSuperReaction,
  onFinish,
}) => {
  if (!activeSuperReaction) return null;

  const meta = SUPER_REACTION_META[activeSuperReaction.type] || SUPER_REACTION_META.GOLDEN_VINYL;

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2800);
    return () => clearTimeout(timer);
  }, [activeSuperReaction]);

  // Generate 10 falling/rising particle positions
  const particles = Array.from({ length: 10 }).map((_, i) => ({
    id: i,
    emoji: meta.emojis[i % meta.emojis.length],
    left: Math.random() * (SCREEN_WIDTH - 60) + 20,
    top: Math.random() * (SCREEN_HEIGHT * 0.4) + SCREEN_HEIGHT * 0.2,
    size: 24 + (i % 3) * 8,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Top Banner Announcement */}
      <View style={styles.bannerWrapper}>
        <View style={[styles.announcementBanner, { backgroundColor: meta.bg, borderColor: meta.color }]}>
          <Text style={styles.bannerEmoji}>{meta.emojis[0]}</Text>
          <View>
            <Text style={[styles.bannerTitle, { color: meta.color }]}>
              {meta.label}
            </Text>
            <Text style={styles.bannerSubtitle}>
              {activeSuperReaction.userName} hyped up the room!
            </Text>
          </View>
        </View>
      </View>

      {/* Floating Particles Overlay */}
      {particles.map((p) => (
        <View
          key={p.id}
          style={[
            styles.particle,
            {
              left: p.left,
              top: p.top,
            },
          ]}
        >
          <Text style={{ fontSize: p.size }}>{p.emoji}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  bannerWrapper: {
    position: "absolute",
    top: 70,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999,
  },
  announcementBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1.5,
  },
  bannerEmoji: {
    fontSize: 22,
  },
  bannerTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.8,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: colors.dark.textPrimary,
    fontWeight: typography.weights.medium,
  },
  particle: {
    position: "absolute",
    zIndex: 998,
  },
});
