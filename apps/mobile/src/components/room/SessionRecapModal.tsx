import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { Award, X, Share2, Check, Clock, ThumbsUp, Mic, MessageSquare, Sparkles } from "lucide-react-native";
import { colors, spacing, typography, radii } from "../../theme/tokens";
import { usePlaybackStore } from "../../store/playbackStore";
import { useRoomStore } from "../../store/roomStore";
import { SessionRecapEngine } from "@sony/music-core";
import { SessionRecapData } from "@sony/types";

interface SessionRecapModalProps {
  visible: boolean;
  onClose: () => void;
  roomName: string;
}

export const SessionRecapModal: React.FC<SessionRecapModalProps> = ({
  visible,
  onClose,
  roomName,
}) => {
  const palette = colors.dark;
  const { currentTrack, queue } = usePlaybackStore();
  const { messages } = useRoomStore();

  const [copiedShare, setCopiedShare] = useState(false);

  const recap: SessionRecapData = useMemo(() => {
    const playedTracks = [
      ...(currentTrack ? [currentTrack] : []),
      ...queue.map((q) => q.track),
    ];

    const upvotesMap: Record<string, number> = {};
    queue.forEach((item) => {
      upvotesMap[item.track.id] = item.upvotes;
    });

    const chatItems = messages.map((m) => ({
      userId: m.sender?.id || "unknown",
      displayName: m.sender?.displayName || "Listener",
    }));


    return SessionRecapEngine.generateRecap({
      roomId: "room-1",
      roomName: roomName || "Late Night Listening Lounge",
      playedTracks,
      queueUpvotes: upvotesMap,
      chatMessages: chatItems,
      voiceStats: [
        { userId: "user-1", displayName: "Sanju", secondsSpoken: 1440 },
        { userId: "user-2", displayName: "Aisha", secondsSpoken: 920 },
      ],
      totalReactions: 64,
      durationMinutes: 112,
    });
  }, [currentTrack, queue, messages, roomName]);

  const handleShare = () => {
    setCopiedShare(true);
    setTimeout(() => {
      setCopiedShare(false);
    }, 2200);
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
              <View style={[styles.iconBadge, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
                <Award size={18} color="#10B981" />
              </View>
              <View>
                <Text style={[styles.title, { color: palette.textPrimary }]}>Session Memory</Text>
                <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
                  {recap.roomName} • Listening Recap
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={palette.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* The Main Memory Card (Wrapped Style) */}
            <View style={[styles.memoryCard, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
              {/* Badge & Room */}
              <View style={styles.cardTopRow}>
                <View style={styles.cardPill}>
                  <Sparkles size={10} color="#F59E0B" />
                  <Text style={styles.cardPillText}>ROOM MEMORY RECAP</Text>
                </View>
                <Text style={[styles.cardDate, { color: palette.textTertiary }]}>Today</Text>
              </View>

              {/* Big Stat: Shared Minutes */}
              <View style={styles.bigStatContainer}>
                <Text style={[styles.bigStatNumber, { color: palette.textPrimary }]}>
                  {recap.durationMinutes}
                </Text>
                <Text style={[styles.bigStatLabel, { color: palette.textSecondary }]}>
                  MINUTES LISTENED TOGETHER
                </Text>
              </View>

              {/* Top Upvoted Song */}
              <View style={[styles.topSongSection, { backgroundColor: palette.card, borderColor: palette.borderSubtle }]}>
                <View style={styles.topSongHeader}>
                  <ThumbsUp size={12} color="#F59E0B" />
                  <Text style={styles.topSongHeading}>TOP UPVOTED TRACK</Text>
                  <Text style={[styles.votesCount, { color: palette.textSecondary }]}>
                    {recap.topUpvotedTrack.upvotes} Upvotes
                  </Text>
                </View>
                <View style={styles.topSongDetails}>
                  {recap.topUpvotedTrack.track.artworkUrl ? (
                    <Image
                      source={{ uri: recap.topUpvotedTrack.track.artworkUrl }}
                      style={styles.songArtwork}
                    />
                  ) : null}
                  <View style={styles.songMeta}>
                    <Text style={[styles.songTitle, { color: palette.textPrimary }]} numberOfLines={1}>
                      {recap.topUpvotedTrack.track.title}
                    </Text>
                    <Text style={[styles.songArtist, { color: palette.textSecondary }]} numberOfLines={1}>
                      {recap.topUpvotedTrack.track.artist}
                    </Text>
                  </View>
                </View>
              </View>

              {/* 3-Column Stats Row */}
              <View style={styles.statsRow}>
                <View style={[styles.miniStatBox, { backgroundColor: palette.card }]}>
                  <Text style={[styles.miniStatVal, { color: palette.textPrimary }]}>
                    {recap.totalTracksPlayed}
                  </Text>
                  <Text style={[styles.miniStatLbl, { color: palette.textTertiary }]}>Tracks</Text>
                </View>
                <View style={[styles.miniStatBox, { backgroundColor: palette.card }]}>
                  <Text style={[styles.miniStatVal, { color: "#38BDF8" }]}>
                    {recap.dominantGenre}
                  </Text>
                  <Text style={[styles.miniStatLbl, { color: palette.textTertiary }]}>
                    {recap.genrePercentage}% Vibe
                  </Text>
                </View>
                <View style={[styles.miniStatBox, { backgroundColor: palette.card }]}>
                  <Text style={[styles.miniStatVal, { color: palette.textPrimary }]}>
                    {recap.averageBpm}
                  </Text>
                  <Text style={[styles.miniStatLbl, { color: palette.textTertiary }]}>Avg BPM</Text>
                </View>
              </View>

              {/* Room MVPs */}
              <View style={styles.mvpSection}>
                {/* Voice Stage Champion */}
                <View style={[styles.mvpCard, { backgroundColor: palette.card, borderColor: palette.borderSubtle }]}>
                  <View style={styles.mvpHeader}>
                    <Mic size={12} color="#34D399" />
                    <Text style={[styles.mvpRole, { color: "#34D399" }]}>STAGE CHAMPION</Text>
                  </View>
                  <Text style={[styles.mvpName, { color: palette.textPrimary }]}>
                    {recap.voiceChampion.displayName}
                  </Text>
                  <Text style={[styles.mvpSub, { color: palette.textTertiary }]}>
                    {recap.voiceChampion.minutesSpoken}m on mic
                  </Text>
                </View>

                {/* Chat MVP */}
                <View style={[styles.mvpCard, { backgroundColor: palette.card, borderColor: palette.borderSubtle }]}>
                  <View style={styles.mvpHeader}>
                    <MessageSquare size={12} color="#F472B6" />
                    <Text style={[styles.mvpRole, { color: "#F472B6" }]}>CHAT MVP</Text>
                  </View>
                  <Text style={[styles.mvpName, { color: palette.textPrimary }]}>
                    {recap.mvpChatter.displayName}
                  </Text>
                  <Text style={[styles.mvpSub, { color: palette.textTertiary }]}>
                    {recap.mvpChatter.messageCount} messages
                  </Text>
                </View>
              </View>
            </View>

            {/* Share / Save Memory Button */}
            <TouchableOpacity
              style={[
                styles.shareBtn,
                { backgroundColor: palette.accent },
                copiedShare && { backgroundColor: "#10B981" },
              ]}
              onPress={handleShare}
            >
              {copiedShare ? (
                <>
                  <Check size={16} color="#FFFFFF" />
                  <Text style={[styles.shareBtnText, { color: "#FFFFFF" }]}>
                    Recap Link Copied! 📸
                  </Text>
                </>
              ) : (
                <>
                  <Share2 size={16} color={palette.background} />
                  <Text style={[styles.shareBtnText, { color: palette.background }]}>
                    Share Room Memory
                  </Text>
                </>
              )}
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
  scrollContent: {
    marginTop: spacing.xs,
  },
  memoryCard: {
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  cardPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  cardPillText: {
    fontSize: 9,
    color: "#F59E0B",
    fontWeight: typography.weights.bold,
    letterSpacing: 0.8,
  },
  cardDate: {
    fontSize: 10,
  },
  bigStatContainer: {
    alignItems: "center",
    marginVertical: spacing.sm,
  },
  bigStatNumber: {
    fontSize: 48,
    fontWeight: typography.weights.bold,
    letterSpacing: -1,
  },
  bigStatLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.2,
    marginTop: 2,
  },
  topSongSection: {
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
    marginVertical: spacing.sm,
  },
  topSongHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: spacing.xs,
  },
  topSongHeading: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: "#F59E0B",
    letterSpacing: 0.8,
  },
  votesCount: {
    fontSize: 10,
    marginLeft: "auto",
  },
  topSongDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  songArtwork: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
  },
  songMeta: {
    flex: 1,
  },
  songTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  songArtist: {
    fontSize: 11,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginVertical: spacing.xs,
  },
  miniStatBox: {
    flex: 1,
    borderRadius: radii.sm,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  miniStatVal: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  miniStatLbl: {
    fontSize: 10,
    marginTop: 2,
  },
  mvpSection: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  mvpCard: {
    flex: 1,
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
  },
  mvpHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  mvpRole: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.8,
  },
  mvpName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  mvpSub: {
    fontSize: 10,
    marginTop: 2,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
  },
  shareBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
});
