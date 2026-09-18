import { SleepTimerModal } from "../../src/components/player/SleepTimerModal";
import { AcousticPresetsModal, AcousticPresetId } from "../../src/components/player/AcousticPresetsModal";
import { RoomShareModal } from "../../src/components/room/RoomShareModal";
import { AmbientSoundscapeModal } from "../../src/components/player/AmbientSoundscapeModal";
import { CrossfadeSettingsModal } from "../../src/components/player/CrossfadeSettingsModal";
import { TasteBlendModal } from "../../src/components/room/TasteBlendModal";
import { SongDedicationModal } from "../../src/components/room/SongDedicationModal";
import { SongDedicationBanner } from "../../src/components/room/SongDedicationBanner";
import { SessionRecapModal } from "../../src/components/room/SessionRecapModal";
import { RoomThemeModal } from "../../src/components/room/RoomThemeModal";
import { SuperReactionShower } from "../../src/components/reactions/SuperReactionShower";
import { SuperReactionModal } from "../../src/components/reactions/SuperReactionModal";
import { AIDJAnnouncementBanner } from "../../src/components/room/AIDJAnnouncementBanner";
import { AIDJSettingsModal } from "../../src/components/room/AIDJSettingsModal";
import { MilestonesModal } from "../../src/components/room/MilestonesModal";
import { SpatialAudioStageModal } from "../../src/components/voice/SpatialAudioStageModal";
import { SingTogetherModal } from "../../src/components/room/SingTogetherModal";
import { SingTogetherInviteModal } from "../../src/components/room/SingTogetherInviteModal";
import { RoomVoiceControlBar } from "../../src/components/voice/RoomVoiceControlBar";
import { useRoomThemeStore } from "../../src/store/roomThemeStore";
import { useThemeStore } from "../../src/store/themeStore";
import { ThemeToggleButton } from "../../src/components/theme/ThemeToggleButton";
import { Moon, Share2, Disc3, CloudRain, Shuffle, Sparkles, Heart, Award, Palette, Headphones, ShieldAlert, Mic2 } from "lucide-react-native";
import { SynchronizedLyrics } from "../../src/components/lyrics/SynchronizedLyrics";
import { AudioSpectrumVisualizer } from "../../src/components/player/AudioSpectrumVisualizer";
import { DJSoundboard, SoundEffectItem } from "../../src/components/room/DJSoundboard";
import { HostModerationModal } from "../../src/components/room/HostModerationModal";
import { ReportModal } from "../../src/components/moderation/ReportModal";
import { ModerationActionType, SuperReactionType, SuperReactionPayload, ReactionBurstPayload, ChatMessageDto } from "@sony/types";
import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronDown,
  MoreHorizontal,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Mic,
  MicOff,
  Send,
  Plus,
  ThumbsUp,
  Trash2,
  Radio,
  Hand,
  Sliders,
  Volume2,
  Check,
} from "lucide-react-native";
import { typography, colors, spacing, radii } from "../../src/theme/tokens";
import { ScrubBar } from "../../src/components/player/ScrubBar";
import { SingTogetherIndicator } from "../../src/components/voice/SingTogetherIndicator";
import { FloatingReactionsOverlay } from "../../src/components/reactions/FloatingReactions";
import {
  usePlaybackStore,
  DUCKING_PROFILES,
  DuckingProfileType,
} from "../../src/store/playbackStore";
import { useRoomStore } from "../../src/store/roomStore";
import { useRoomsStore } from "../../src/store/roomsStore";
import { useAuthStore } from "../../src/store/authStore";
import { socketService } from "../../src/services/socketService";
import { useSyncEngine } from "../../src/hooks/useSyncEngine";
import { useAudioDucking } from "../../src/hooks/useAudioDucking";
import { MusicSearchModal } from "../../src/components/music/MusicSearchModal";
import { VoiceMessagePlayer } from "../../src/components/voice/VoiceMessagePlayer";
import { useModerationStore } from "../../src/store/moderationStore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function RoomScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const roomId = (id as string) || "room-live";
  const { isDark, palette: themePalette } = useThemeStore();
  const { theme, activeDedication } = useRoomThemeStore();
  const palette = {
    ...themePalette,
    accent: isDark ? (theme.accent || themePalette.accent) : themePalette.accent,
  };

  const { token, user } = useAuthStore((s) => ({ token: s.tokens?.accessToken, user: s.user }));
  const { getRoomById } = useRoomsStore();
  const storedRoom = getRoomById(roomId);

  // Synchronized playback & ducking engines
  useSyncEngine(roomId);
  const { volume, duckingState, isVoiceActive, setVoiceActive } = useAudioDucking();

  const {
    currentTrack,
    isPlaying,
    positionMs,
    durationMs,
    togglePlay,
    seek,
    queue,
    addToQueue,
    removeFromQueue,
    upvoteQueueItem,
    playNext,
    playTrackImmediate,
    duckingProfile,
    setDuckingProfile,
    crossfade,
    soundscape,
  } = usePlaybackStore();

  const {
    currentRoom,
    setRoom,
    addMessage,
    members,
    messages,
    reactions,
    addReaction,
    removeReaction,
    activeSuperReaction,
    setSuperReaction,
    activeAnnouncement,
    setActiveAnnouncement,
    isVoiceMuted,
    toggleMute,
    isSingTogetherActive,
    singTogetherParticipants,
    activeSingTogetherInvite,
    joinSingTogether,
    leaveSingTogether,
    dismissSingTogetherInvite,
  } = useRoomStore();

  // If entering a room that exists in roomsStore, initialize room and starting track
  useEffect(() => {
    if (!currentRoom && storedRoom) {
      const currentUser = user || { id: "user-me", username: "me", displayName: "You" };
      setRoom(storedRoom, [
        {
          userId: currentUser.id,
          roomId,
          role: "HOST",
          isMuted: false,
          isDeafened: false,
          isSpeaking: false,
          joinedAt: new Date().toISOString(),
          user: currentUser,
        },
      ]);
    }
  }, [currentRoom, storedRoom, roomId, user]);

  useEffect(() => {
    if (!currentTrack && storedRoom?.currentTrack) {
      playTrackImmediate(storedRoom.currentTrack);
    }
  }, [currentTrack, storedRoom]);

  const [activeTab, setActiveTab] = useState<"chat" | "voice" | "queue">("chat");
  const [chatInput, setChatInput] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [hasRaisedHand, setHasRaisedHand] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);
  const [showAcousticModal, setShowAcousticModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSoundscapeModal, setShowSoundscapeModal] = useState(false);
  const [showCrossfadeModal, setShowCrossfadeModal] = useState(false);
  const [showTasteBlendModal, setShowTasteBlendModal] = useState(false);
  const [showDedicationModal, setShowDedicationModal] = useState(false);
  const [showRecapModal, setShowRecapModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showSuperReactionModal, setShowSuperReactionModal] = useState(false);
  const [showAIDJModal, setShowAIDJModal] = useState(false);
  const [showMilestonesModal, setShowMilestonesModal] = useState(false);
  const [showSpatialModal, setShowSpatialModal] = useState(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | "track_end" | null>(null);
  const [sleepRemainingSeconds, setSleepRemainingSeconds] = useState<number | null>(null);
  const [acousticPreset, setAcousticPreset] = useState<AcousticPresetId>("CLEARAUDIO");
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSingTogetherModal, setShowSingTogetherModal] = useState(false);
  const { kickUserFromRoom } = useModerationStore();



  // Sleep timer interval
  useEffect(() => {
    if (sleepRemainingSeconds === null) return;
    if (sleepRemainingSeconds <= 0) {
      togglePlay();
      setSleepTimerMinutes(null);
      setSleepRemainingSeconds(null);
      return;
    }

    const timer = setInterval(() => {
      setSleepRemainingSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [sleepRemainingSeconds]);

  const handleSetSleepTimer = (val: number | "track_end") => {
    setSleepTimerMinutes(val);
    if (val === "track_end") {
      const remainingMs = Math.max(1000, durationMs - positionMs);
      setSleepRemainingSeconds(Math.ceil(remainingMs / 1000));
    } else {
      setSleepRemainingSeconds(val * 60);
    }
  };

  const handleCancelSleepTimer = () => {
    setSleepTimerMinutes(null);
    setSleepRemainingSeconds(null);
  };


  useEffect(() => {
    if (token) {
      socketService.connect(token);
      socketService.joinRoom(roomId);
    }
    return () => {
      socketService.leaveRoom(roomId);
    };
  }, [roomId, token]);

  const sendReaction = (emoji: string, event?: any) => {
    let originX: number | undefined;
    let originY: number | undefined;

    if (event?.nativeEvent?.pageX !== undefined && event?.nativeEvent?.pageY !== undefined) {
      originX = event.nativeEvent.pageX;
      originY = event.nativeEvent.pageY;
    }

    const payload: ReactionBurstPayload = {
      roomId,
      emoji,
      userId: user?.id || "user-me",
      userDisplayName: user?.displayName || "You",
      timestamp: Date.now() + Math.random(),
      originX,
      originY,
    };

    // 1. Immediately trigger rich floating reaction cluster locally
    addReaction(payload);

    // 2. Broadcast to room participants via WebSocket
    socketService.sendReaction(roomId, emoji);
  };

  const handleTriggerSuperReaction = (type: SuperReactionType) => {
    const currentUser = user || { id: "user-me", username: "me", displayName: "You" };
    const payload: SuperReactionPayload = {
      roomId,
      type,
      userId: currentUser.id,
      userName: currentUser.displayName,
      timestamp: Date.now(),
    };
    setSuperReaction(payload);
    socketService.sendSuperReaction(payload);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const content = chatInput.trim();
    const currentUser = user || { id: "user-me", username: "me", displayName: "You" };
    addMessage({
      id: "msg-" + Date.now(),
      roomId,
      type: "TEXT",
      content,
      createdAt: new Date().toISOString(),
      sender: currentUser,
    });
    socketService.sendChatMessage(roomId, content);
    setChatInput("");
  };

  const handleSendVoiceNote = (recordedSec?: number, customWave?: number[]) => {
    const durationSec = recordedSec || Math.floor(Math.random() * 5) + 3;
    const randomWave = customWave && customWave.length > 0
      ? customWave
      : Array.from({ length: 14 }, () =>
          Number((Math.random() * 0.7 + 0.3).toFixed(2))
        );
    const currentUser = user || { id: "user-me", username: "me", displayName: "You" };
    addMessage({
      id: "voice-" + Date.now(),
      roomId,
      type: "VOICE",
      content: `🎤 Voice note (${durationSec}s)`,
      createdAt: new Date().toISOString(),
      sender: currentUser,
      voiceMessage: {
        id: "vm-" + Date.now(),
        senderId: currentUser.id,
        storageKey: `voice/${roomId}/${Date.now()}.ogg`,
        durationSec,
        waveformMetadata: randomWave,
        createdAt: new Date().toISOString(),
      },
    });
  };

  const handlePlayToggle = () => {
    togglePlay();
    socketService.sendPlaybackCommand({
      roomId,
      action: isPlaying ? "PAUSE" : "PLAY",
      positionMs,
      clientTimestamp: Date.now(),
    });
  };

  const handleSeek = (targetPos: number) => {
    seek(targetPos);
    socketService.sendPlaybackCommand({
      roomId,
      action: "SEEK",
      positionMs: targetPos,
      clientTimestamp: Date.now(),
    });
  };

  const formatDuration = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]} edges={["top", "bottom"]}>
      {/* Floating Reactions Overlay */}
      <FloatingReactionsOverlay reactions={reactions} onFinish={removeReaction} />

      {/* Fullscreen Super Reaction Burst Shower */}
      <SuperReactionShower
        activeSuperReaction={activeSuperReaction}
        onFinish={() => setSuperReaction(null)}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <ChevronDown size={22} color={palette.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.roomTitle, { color: palette.textPrimary }]}>
            {currentRoom?.name || storedRoom?.name || "Listening Room"}
          </Text>
          <View style={styles.liveMeta}>
            <View style={[styles.liveDot, { backgroundColor: palette.speaking }]} />
            <Text style={[styles.roomSubtitle, { color: palette.textTertiary }]}>{members.length} listening synchronized</Text>
          </View>
        </View>
        <ThemeToggleButton />
        <TouchableOpacity style={styles.iconBtn} onPress={() => setShowSearchModal(true)}>
          <Plus size={20} color={palette.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setShowModerationModal(true)}>
          <MoreHorizontal size={20} color={palette.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setShowReportModal(true)}
          accessibilityLabel="Report Room or Incident"
        >
          <ShieldAlert size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Active Song Dedication Pinned Banner */}
        {activeDedication && (
          <View style={{ marginBottom: spacing.xs }}>
            <SongDedicationBanner dedication={activeDedication} />
          </View>
        )}

        {/* Active AI DJ Transition Commentary Announcement */}
        {activeAnnouncement && (
          <AIDJAnnouncementBanner
            announcement={activeAnnouncement}
            onDismiss={() => setActiveAnnouncement(null)}
          />
        )}

        {/* Mode Toggle Pill (Artwork vs Live Lyrics) */}
        <View style={styles.viewToggleContainer}>

          <View style={[styles.viewTogglePill, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
            <TouchableOpacity
              style={[styles.viewToggleBtn, !showLyrics && { backgroundColor: palette.accent }]}
              onPress={() => setShowLyrics(false)}
            >
              <Text style={[styles.viewToggleText, { color: !showLyrics ? palette.accentInverted : palette.textSecondary }]}>
                Artwork
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.viewToggleBtn, showLyrics && { backgroundColor: palette.accent }]}
              onPress={() => setShowLyrics(true)}
            >
              <Text style={[styles.viewToggleText, { color: showLyrics ? palette.accentInverted : palette.textSecondary }]}>
                🎤 Live Lyrics
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {showLyrics ? (
          <SynchronizedLyrics
            track={currentTrack}
            trackId={currentTrack?.id}
            positionMs={positionMs}
            onSeek={handleSeek}
          />
        ) : (
          <TouchableOpacity
            activeOpacity={currentTrack ? 1 : 0.8}
            onPress={() => {
              if (!currentTrack) setShowSearchModal(true);
            }}
            style={styles.artworkContainer}
          >
            <Image
              source={{ uri: currentTrack?.artworkUrl || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&fit=crop&q=80" }}
              style={styles.artwork}
            />
          </TouchableOpacity>
        )}

        {/* Track Title & Artist */}
        <TouchableOpacity
          activeOpacity={currentTrack ? 1 : 0.8}
          onPress={() => {
            if (!currentTrack) setShowSearchModal(true);
          }}
          style={styles.trackInfo}
        >
          <Text style={[styles.trackTitle, { color: palette.textPrimary }]}>
            {currentTrack?.title || "No track queued"}
          </Text>
          <Text style={[styles.artistName, { color: palette.textSecondary }]}>
            {currentTrack?.artist || "Tap to select music from library"}
          </Text>
        </TouchableOpacity>

        {/* Sing Together Active Live Banner */}
        {isSingTogetherActive && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowSingTogetherModal(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              alignSelf: "center",
              backgroundColor: "rgba(244, 63, 94, 0.16)",
              borderColor: "rgba(244, 63, 94, 0.4)",
              borderWidth: 1,
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 5,
              marginBottom: 10,
              gap: 6,
            }}
          >
            <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#F43F5E" }} />
            <Text style={{ color: "#F43F5E", fontSize: 11, fontWeight: "700", letterSpacing: 0.3 }}>
              SING TOGETHER ACTIVE · {singTogetherParticipants.length} in Chorus (Tap to View)
            </Text>
          </TouchableOpacity>
        )}

        {/* Real-time Frequency Spectrum Visualizer */}
        <AudioSpectrumVisualizer
          isPlaying={isPlaying}
          volume={volume}
          duckingState={duckingState}
          isVoiceActive={isVoiceActive}
        />


        {/* Synchronized Scrub Bar */}
        <ScrubBar
          positionMs={positionMs}
          durationMs={durationMs}
          onSeek={handleSeek}
          isDark={isDark}
        />

        {/* Minimal Playback Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.controlBtn} onPress={() => seek(0)}>
            <SkipBack size={22} color={palette.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.playPauseBtn, { backgroundColor: palette.accent }]}
            onPress={handlePlayToggle}
          >
            {isPlaying ? (
              <Pause size={22} color={palette.accentInverted} />
            ) : (
              <Play size={22} color={palette.accentInverted} style={{ marginLeft: 3 }} />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={playNext}>
            <SkipForward size={22} color={palette.textSecondary} />
          </TouchableOpacity>
        </View>


        {/* Quick Tools Row 1 (Sleep Timer | Acoustic EQ | Share Room) */}
        <View style={styles.quickToolsRow}>
          <TouchableOpacity
            style={[
              styles.quickToolBtn,
              {
                backgroundColor: sleepRemainingSeconds !== null ? palette.speaking : palette.surface,
                borderColor: sleepRemainingSeconds !== null ? palette.speaking : palette.borderSubtle,
              },
            ]}
            onPress={() => setShowSleepTimerModal(true)}
          >
            <Moon size={12} color={sleepRemainingSeconds !== null ? "#FFFFFF" : palette.textSecondary} style={{ marginRight: 4 }} />
            <Text
              style={[
                styles.quickToolText,
                { color: sleepRemainingSeconds !== null ? "#FFFFFF" : palette.textSecondary },
              ]}
            >
              {sleepRemainingSeconds !== null
                ? Math.ceil(sleepRemainingSeconds / 60) + "m left"
                : "Sleep"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickToolBtn, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}
            onPress={() => setShowAcousticModal(true)}
          >
            <Sliders size={12} color={palette.textSecondary} style={{ marginRight: 4 }} />
            <Text style={[styles.quickToolText, { color: palette.textSecondary }]}>
              EQ: {acousticPreset === "CLEARAUDIO" ? "ClearAudio+" : acousticPreset === "WARM_VINYL" ? "Vinyl" : acousticPreset === "BASS_BOOST" ? "Bass" : "Vocal"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickToolBtn, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}
            onPress={() => setShowShareModal(true)}
          >
            <Share2 size={12} color={palette.textSecondary} style={{ marginRight: 4 }} />
            <Text style={[styles.quickToolText, { color: palette.textSecondary }]}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Tools Row 2 (Atmosphere | DJ Crossfade | Party Blend) */}
        <View style={[styles.quickToolsRow, { marginTop: 4 }]}>
          <TouchableOpacity
            style={[
              styles.quickToolBtn,
              {
                backgroundColor: soundscape.isPlaying && soundscape.type !== "OFF" ? "#1E293B" : palette.surface,
                borderColor: soundscape.isPlaying && soundscape.type !== "OFF" ? "#38BDF8" : palette.borderSubtle,
              },
            ]}
            onPress={() => setShowSoundscapeModal(true)}
          >
            <CloudRain size={12} color={soundscape.isPlaying && soundscape.type !== "OFF" ? "#38BDF8" : palette.textSecondary} style={{ marginRight: 4 }} />
            <Text
              style={[
                styles.quickToolText,
                { color: soundscape.isPlaying && soundscape.type !== "OFF" ? "#38BDF8" : palette.textSecondary },
              ]}
            >
              {soundscape.isPlaying && soundscape.type !== "OFF" ? `Atmosphere: ${soundscape.type}` : "Atmosphere"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickToolBtn,
              {
                backgroundColor: crossfade.enabled ? palette.surface : palette.surface,
                borderColor: crossfade.enabled ? "#60A5FA" : palette.borderSubtle,
              },
            ]}
            onPress={() => setShowCrossfadeModal(true)}
          >
            <Shuffle size={12} color={crossfade.enabled ? "#60A5FA" : palette.textSecondary} style={{ marginRight: 4 }} />
            <Text style={[styles.quickToolText, { color: crossfade.enabled ? "#60A5FA" : palette.textSecondary }]}>
              {crossfade.enabled ? `DJ Blend: ${crossfade.durationSec}s` : "Crossfade"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickToolBtn,
              {
                backgroundColor: "rgba(245, 158, 11, 0.08)",
                borderColor: "rgba(245, 158, 11, 0.3)",
              },
            ]}
            onPress={() => setShowTasteBlendModal(true)}
          >
            <Sparkles size={12} color="#F59E0B" style={{ marginRight: 4 }} />
            <Text style={[styles.quickToolText, { color: "#FBBF24" }]}>Taste Blend</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Tools Row 3 (Song Dedication | Room Memory Recap | Room Theme) */}
        <View style={[styles.quickToolsRow, { marginTop: 4 }]}>
          <TouchableOpacity
            style={[
              styles.quickToolBtn,
              {
                backgroundColor: "rgba(236, 72, 153, 0.08)",
                borderColor: "rgba(236, 72, 153, 0.3)",
              },
            ]}
            onPress={() => setShowDedicationModal(true)}
          >
            <Heart size={12} color="#EC4899" style={{ marginRight: 4 }} />
            <Text style={[styles.quickToolText, { color: "#EC4899" }]}>Dedicate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickToolBtn,
              {
                backgroundColor: "rgba(16, 185, 129, 0.08)",
                borderColor: "rgba(16, 185, 129, 0.3)",
              },
            ]}
            onPress={() => setShowRecapModal(true)}
          >
            <Award size={12} color="#10B981" style={{ marginRight: 4 }} />
            <Text style={[styles.quickToolText, { color: "#10B981" }]}>Memory</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickToolBtn,
              {
                backgroundColor: palette.surface,
                borderColor: palette.accent,
              },
            ]}
            onPress={() => setShowThemeModal(true)}
          >
            <Palette size={12} color={palette.textPrimary} style={{ marginRight: 4 }} />
            <Text style={[styles.quickToolText, { color: palette.textPrimary }]}>
              {theme.name.split(" ")[0]}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Tools Row 4 (AI DJ Co-Pilot | Milestones & Streaks | 2D Spatial Stage) */}
        <View style={[styles.quickToolsRow, { marginTop: 4 }]}>
          <TouchableOpacity
            style={[
              styles.quickToolBtn,
              {
                backgroundColor: "rgba(139, 92, 246, 0.08)",
                borderColor: "rgba(139, 92, 246, 0.3)",
              },
            ]}
            onPress={() => setShowAIDJModal(true)}
          >
            <Radio size={12} color="#A78BFA" style={{ marginRight: 4 }} />
            <Text style={[styles.quickToolText, { color: "#A78BFA" }]}>AI DJ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickToolBtn,
              {
                backgroundColor: "rgba(245, 158, 11, 0.08)",
                borderColor: "rgba(245, 158, 11, 0.3)",
              },
            ]}
            onPress={() => setShowMilestonesModal(true)}
          >
            <Award size={12} color="#F59E0B" style={{ marginRight: 4 }} />
            <Text style={[styles.quickToolText, { color: "#F59E0B" }]}>Milestones</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickToolBtn,
              {
                backgroundColor: "rgba(56, 189, 248, 0.08)",
                borderColor: "rgba(56, 189, 248, 0.3)",
              },
            ]}
            onPress={() => setShowSpatialModal(true)}
          >
            <Headphones size={12} color="#38BDF8" style={{ marginRight: 4 }} />
            <Text style={[styles.quickToolText, { color: "#38BDF8" }]}>Spatial Stage</Text>
          </TouchableOpacity>
        </View>


        {/* Sing Together Live Ducking Status Badge */}
        <View style={{ marginVertical: spacing.sm }}>

          <SingTogetherIndicator volume={volume} duckingState={duckingState} isDark={false} />
        </View>

        {/* People Listening Roster */}
        <View style={styles.listenersSection}>
          <Text style={[styles.sectionLabel, { color: palette.textTertiary }]}>PEOPLE LISTENING</Text>
          <View style={styles.listenerList}>
            {members.map((m) => (
              <View
                key={m.userId}
                style={[
                  styles.memberPill,
                  {
                    backgroundColor: m.isSpeaking ? "rgba(16, 185, 129, 0.1)" : palette.surface,
                    borderColor: m.isSpeaking ? palette.speaking : palette.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.speakingIndicatorDot,
                    { backgroundColor: m.isSpeaking ? palette.speaking : palette.textTertiary },
                  ]}
                />
                <Text
                  style={[
                    styles.memberName,
                    { color: m.isSpeaking ? palette.textPrimary : palette.textSecondary },
                  ]}
                >
                  {m.user.displayName} {m.role === "HOST" ? "👑" : ""}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* DJ Soundboard */}
        <DJSoundboard
          onTriggerSound={(sound) => {
            sendReaction(sound.emoji);
          }}
        />

        {/* Reaction Bar */}
        <View style={styles.reactionBar}>
          {["🔥", "❤️", "🙌", "✨", "⚡️", "🎧"].map((emoji) => (
            <TouchableOpacity
              key={emoji}
              activeOpacity={0.6}
              style={[styles.reactionBtn, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}
              onPress={(e) => sendReaction(emoji, e)}
            >
              <Text style={styles.reactionText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[
              styles.superReactionBtn,
              { backgroundColor: "rgba(245, 158, 11, 0.15)", borderColor: "#F59E0B" },
            ]}
            onPress={() => setShowSuperReactionModal(true)}
          >
            <Sparkles size={16} color="#F59E0B" />
          </TouchableOpacity>
        </View>

        {/* Lower Tab Selector (Chat | Voice | Queue) */}
        <View style={[styles.subTabRow, { borderBottomColor: palette.borderSubtle }]}>
          <TouchableOpacity
            style={[styles.subTab, activeTab === "chat" && { borderBottomColor: palette.textPrimary }]}
            onPress={() => setActiveTab("chat")}
          >
            <Text style={[styles.subTabText, activeTab === "chat" && { color: palette.textPrimary, fontWeight: "600" }]}>
              Chat
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTab, activeTab === "voice" && { borderBottomColor: palette.textPrimary }]}
            onPress={() => setActiveTab("voice")}
          >
            <Text style={[styles.subTabText, activeTab === "voice" && { color: palette.textPrimary, fontWeight: "600" }]}>
              Voice ({members.filter((m) => !m.isMuted || m.isSpeaking).length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTab, activeTab === "queue" && { borderBottomColor: palette.textPrimary }]}
            onPress={() => setActiveTab("queue")}
          >
            <Text style={[styles.subTabText, activeTab === "queue" && { color: palette.textPrimary, fontWeight: "600" }]}>
              Queue ({queue.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* ACTIVE TAB CONTENT: CHAT */}
        {activeTab === "chat" && (
          <View style={styles.chatSection}>
            <View style={styles.messageFeed}>
              {messages.length === 0 ? (
                <Text style={{ fontSize: 13, color: palette.textTertiary, fontStyle: "italic", textAlign: "center", marginVertical: 12 }}>
                  No messages yet. Say hello or introduce the vibe!
                </Text>
              ) : (
                messages.map((msg) => (
                  <View key={msg.id} style={[styles.messageRow, { alignItems: msg.type === "VOICE" ? "flex-start" : "center", marginBottom: 6 }]}>
                    <Text style={[styles.msgSender, { color: palette.textPrimary }]}>{msg.sender.displayName}: </Text>
                    {msg.type === "VOICE" && msg.voiceMessage ? (
                      <View style={{ marginTop: 2 }}>
                        <VoiceMessagePlayer
                          id={msg.id}
                          duration={msg.voiceMessage.durationSec}
                          waveform={msg.voiceMessage.waveformMetadata}
                          isMe={msg.sender.id === user?.id}
                        />
                      </View>
                    ) : (
                      <Text style={[styles.msgContent, { color: palette.textSecondary }]}>{msg.content}</Text>
                    )}
                  </View>
                ))
              )}
            </View>

            <View style={[styles.chatInputRow, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              <TouchableOpacity
                style={{ width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", marginRight: 6, backgroundColor: palette.background }}
                onPress={() => handleSendVoiceNote()}
                accessibilityLabel="Send voice note"
              >
                <Mic size={14} color={palette.speaking} />
              </TouchableOpacity>
              <TextInput
                value={chatInput}
                onChangeText={setChatInput}
                placeholder="Say something to the room..."
                placeholderTextColor={palette.textTertiary}
                style={[styles.chatTextInput, { color: palette.textPrimary }]}
                onSubmitEditing={handleSendMessage}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage}>
                <Send size={16} color={palette.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ACTIVE TAB CONTENT: VOICE STAGE & DUCKING CONTROLS */}
        {activeTab === "voice" && (
          <View style={styles.voiceSection}>
            {/* SFU Status Card */}
            <View style={[styles.sfuStatusBanner, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
              <View style={styles.sfuLeft}>
                <Radio size={14} color={palette.speaking} style={{ marginRight: 6 }} />
                <Text style={[styles.sfuText, { color: palette.textPrimary }]}>LiveKit WebRTC SFU</Text>
              </View>
              <Text style={[styles.sfuMeta, { color: palette.textTertiary }]}>24ms · Opus 48kHz</Text>
            </View>

            {/* Speakers on Stage */}
            <View style={styles.voiceBlock}>
              <Text style={[styles.blockLabel, { color: palette.textTertiary }]}>ON STAGE</Text>
              <View style={styles.stageGrid}>
                {members
                  .filter((m) => m.role === "HOST" || !m.isMuted || m.isSpeaking)
                  .map((m) => (
                    <View
                      key={m.userId}
                      style={[
                        styles.stageSpeakerCard,
                        {
                          backgroundColor: palette.surface,
                          borderColor: m.isSpeaking ? palette.speaking : palette.borderSubtle,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.avatarRing,
                          {
                            borderColor: m.isSpeaking ? palette.speaking : palette.border,
                            backgroundColor: palette.accent,
                          },
                        ]}
                      >
                        <Text style={styles.avatarLetter}>{m.user.displayName.charAt(0)}</Text>
                        {m.isSpeaking && (
                          <View style={[styles.speakingBadge, { backgroundColor: palette.speaking }]} />
                        )}
                      </View>
                      <Text style={[styles.speakerName, { color: palette.textPrimary }]} numberOfLines={1}>
                        {m.user.displayName}
                      </Text>
                      <Text style={[styles.speakerRole, { color: palette.textTertiary }]}>
                        {m.role === "HOST" ? "Host" : m.isSpeaking ? "Speaking" : "Muted"}
                      </Text>
                    </View>
                  ))}
              </View>
            </View>

            {/* Ducking Profile Controls */}
            <View style={styles.voiceBlock}>
              <View style={styles.blockTitleRow}>
                <Sliders size={14} color={palette.textSecondary} style={{ marginRight: 6 }} />
                <Text style={[styles.blockLabel, { color: palette.textTertiary }]}>SING TOGETHER / DUCKING PROFILE</Text>
              </View>
              <View style={styles.duckingProfilesList}>
                {(Object.keys(DUCKING_PROFILES) as DuckingProfileType[]).map((prof) => {
                  const item = DUCKING_PROFILES[prof];
                  const isSelected = duckingProfile === prof;
                  return (
                    <TouchableOpacity
                      key={prof}
                      style={[
                        styles.duckingProfileCard,
                        {
                          backgroundColor: isSelected ? palette.textPrimary : palette.surface,
                          borderColor: isSelected ? palette.textPrimary : palette.borderSubtle,
                        },
                      ]}
                      onPress={() => setDuckingProfile(prof)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.profileTitle,
                            { color: isSelected ? "#FFFFFF" : palette.textPrimary },
                          ]}
                        >
                          {item.label}
                        </Text>
                        <Text
                          style={[
                            styles.profileDesc,
                            { color: isSelected ? "rgba(255,255,255,0.7)" : palette.textTertiary },
                          ]}
                        >
                          {item.description}
                        </Text>
                      </View>
                      {isSelected && <Check size={16} color="#FFFFFF" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Listener Hand Raise Action */}
            <View style={styles.voiceActionsRow}>
              <TouchableOpacity
                style={[
                  styles.handRaiseBtn,
                  {
                    backgroundColor: hasRaisedHand ? palette.speaking : palette.surface,
                    borderColor: hasRaisedHand ? palette.speaking : palette.border,
                  },
                ]}
                onPress={() => setHasRaisedHand(!hasRaisedHand)}
              >
                <Hand size={16} color={hasRaisedHand ? "#FFFFFF" : palette.textPrimary} style={{ marginRight: 6 }} />
                <Text
                  style={[
                    styles.handRaiseText,
                    { color: hasRaisedHand ? "#FFFFFF" : palette.textPrimary },
                  ]}
                >
                  {hasRaisedHand ? "Hand Raised · Waiting for Host" : "Raise Hand to Speak"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ACTIVE TAB CONTENT: QUEUE */}
        {activeTab === "queue" && (
          <View style={styles.queueSection}>
            {/* Now Playing Mini Banner */}
            <View style={[styles.nowPlayingCard, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
              <Image source={{ uri: currentTrack?.artworkUrl }} style={styles.queueThumb} />
              <View style={styles.nowPlayingInfo}>
                <Text style={[styles.nowPlayingLabel, { color: palette.speaking }]}>NOW PLAYING</Text>
                <Text style={[styles.nowPlayingTitle, { color: palette.textPrimary }]} numberOfLines={1}>
                  {currentTrack?.title}
                </Text>
                <Text style={[styles.nowPlayingArtist, { color: palette.textSecondary }]} numberOfLines={1}>
                  {currentTrack?.artist}
                </Text>
              </View>
              <View style={styles.equalizerIndicator}>
                <View style={[styles.eqBar, { height: 16, backgroundColor: palette.speaking }]} />
                <View style={[styles.eqBar, { height: 10, backgroundColor: palette.speaking }]} />
                <View style={[styles.eqBar, { height: 14, backgroundColor: palette.speaking }]} />
              </View>
            </View>

            {/* Queue Header & Add Button */}
            <View style={styles.queueHeaderRow}>
              <Text style={[styles.blockLabel, { color: palette.textTertiary }]}>UPCOMING TRACKS ({queue.length})</Text>
              <TouchableOpacity
                style={[styles.addTrackBtn, { backgroundColor: palette.surface, borderColor: palette.border }]}
                onPress={() => setShowSearchModal(true)}
              >
                <Plus size={14} color={palette.textPrimary} style={{ marginRight: 4 }} />
                <Text style={[styles.addTrackText, { color: palette.textPrimary }]}>Add Track</Text>
              </TouchableOpacity>
            </View>

            {/* Queue Items */}
            {queue.length === 0 ? (
              <View style={[styles.emptyQueue, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}>
                <Text style={[styles.emptyText, { color: palette.textTertiary }]}>Queue is empty. Search & add songs to listen together!</Text>
              </View>
            ) : (
              <View style={styles.queueList}>
                {queue.map((item, index) => (
                  <View
                    key={item.id}
                    style={[
                      styles.queueItemCard,
                      { backgroundColor: palette.surface, borderColor: palette.borderSubtle },
                    ]}
                  >
                    <Text style={[styles.queueIndex, { color: palette.textTertiary }]}>#{index + 1}</Text>
                    <Image source={{ uri: item.track.artworkUrl }} style={styles.queueThumb} />
                    <View style={styles.queueDetails}>
                      <Text style={[styles.queueTrackTitle, { color: palette.textPrimary }]} numberOfLines={1}>
                        {item.track.title}
                      </Text>
                      <Text style={[styles.queueTrackArtist, { color: palette.textSecondary }]} numberOfLines={1}>
                        {item.track.artist} · {formatDuration(item.track.durationMs)}
                      </Text>
                      <Text style={[styles.queueAddedBy, { color: palette.textTertiary }]}>
                        added by {item.addedBy.displayName}
                      </Text>
                    </View>

                    <View style={styles.queueActions}>
                      <TouchableOpacity
                        style={[
                          styles.upvoteBtn,
                          {
                            backgroundColor: item.hasUpvoted ? palette.speaking : "transparent",
                            borderColor: item.hasUpvoted ? palette.speaking : palette.border,
                          },
                        ]}
                        onPress={() => upvoteQueueItem(item.id)}
                      >
                        <ThumbsUp size={12} color={item.hasUpvoted ? "#FFFFFF" : palette.textSecondary} style={{ marginRight: 4 }} />
                        <Text
                          style={[
                            styles.upvoteCount,
                            { color: item.hasUpvoted ? "#FFFFFF" : palette.textSecondary },
                          ]}
                        >
                          {item.upvotes}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.queueIconBtn, { borderColor: palette.border }]}
                        onPress={() => playTrackImmediate(item.track)}
                      >
                        <Play size={12} color={palette.textPrimary} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.queueIconBtn, { borderColor: palette.border }]}
                        onPress={() => removeFromQueue(item.id)}
                      >
                        <Trash2 size={12} color={palette.textTertiary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Distinct Controls: 1. Sing Together (Chorus Broadcast) & 2. Voice Chat (WhatsApp Voice Note + Stage Mic) */}
        <RoomVoiceControlBar
          onSendVoiceMessage={(dur, wave) => handleSendVoiceNote(dur, wave)}
          onOpenSingTogether={() => setShowSingTogetherModal(true)}
          isSingTogetherActive={isSingTogetherActive}
          singTogetherCount={singTogetherParticipants.length}
        />
      </ScrollView>

      {/* Music Search & Queue Modal */}
      <MusicSearchModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onAddToQueue={(track) => addToQueue(track)}
        onSelectTrack={(track) => playTrackImmediate(track)}
      />

      {/* Host Moderation Modal */}
      <HostModerationModal
        visible={showModerationModal}
        onClose={() => setShowModerationModal(false)}
        members={members}
        onModerationAction={(targetId, action) => {
          if (action === "KICK") {
            kickUserFromRoom(roomId, targetId);
          }
          setShowModerationModal(false);
        }}
      />

      {/* Safety & Incident Report Modal */}
      <ReportModal
        visible={showReportModal}
        targetType="ROOM"
        targetId={roomId}
        targetName={currentRoom?.name || "Room"}
        onClose={() => setShowReportModal(false)}
      />

      {/* Sleep Timer Modal */}
      <SleepTimerModal
        visible={showSleepTimerModal}
        onClose={() => setShowSleepTimerModal(false)}
        onTimerSet={handleSetSleepTimer}
        onCancelTimer={handleCancelSleepTimer}
        activeTimerMinutes={typeof sleepTimerMinutes === "number" ? sleepTimerMinutes : null}
        remainingSeconds={sleepRemainingSeconds}
      />

      {/* Acoustic EQ Presets Modal */}
      <AcousticPresetsModal
        visible={showAcousticModal}
        onClose={() => setShowAcousticModal(false)}
        selectedPreset={acousticPreset}
        onSelectPreset={setAcousticPreset}
      />

      {/* Room Share Modal */}
      <RoomShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        room={currentRoom}
        track={currentTrack}
      />

      {/* Ambient Soundscape Modal */}
      <AmbientSoundscapeModal
        visible={showSoundscapeModal}
        onClose={() => setShowSoundscapeModal(false)}
      />

      {/* Crossfade Settings Modal */}
      <CrossfadeSettingsModal
        visible={showCrossfadeModal}
        onClose={() => setShowCrossfadeModal(false)}
      />

      {/* Taste Blend Modal */}
      <TasteBlendModal
        visible={showTasteBlendModal}
        onClose={() => setShowTasteBlendModal(false)}
        roomTitle={currentRoom?.name || "Late Night Studio"}
      />

      {/* Song Dedication Modal */}
      <SongDedicationModal
        visible={showDedicationModal}
        onClose={() => setShowDedicationModal(false)}
        currentTrack={currentTrack}
        roomId={roomId}
      />

      {/* Session Memory Recap Modal */}
      <SessionRecapModal
        visible={showRecapModal}
        onClose={() => setShowRecapModal(false)}
        roomName={currentRoom?.name || "Late Night Lounge"}
      />

      {/* Room Reactive Theme Modal */}
      <RoomThemeModal
        visible={showThemeModal}
        onClose={() => setShowThemeModal(false)}
      />

      {/* Super Reaction Burst Modal */}
      <SuperReactionModal
        visible={showSuperReactionModal}
        onClose={() => setShowSuperReactionModal(false)}
        onTrigger={handleTriggerSuperReaction}
      />

      {/* AI Collaborative DJ Co-Pilot Settings Modal */}
      <AIDJSettingsModal
        visible={showAIDJModal}
        onClose={() => setShowAIDJModal(false)}
        roomId={roomId}
        currentTrack={currentTrack}
      />

      {/* Room Group Milestones & Streaks Modal */}
      <MilestonesModal
        visible={showMilestonesModal}
        onClose={() => setShowMilestonesModal(false)}
        roomId={roomId}
      />

      {/* 2D Interactive Spatial Audio Stage Modal */}
      <SpatialAudioStageModal
        visible={showSpatialModal}
        onClose={() => setShowSpatialModal(false)}
        roomId={roomId}
      />

      {/* Dedicated Sing Together Modal (Chorus Broadcast & Lyrics) */}
      <SingTogetherModal
        visible={showSingTogetherModal}
        onClose={() => setShowSingTogetherModal(false)}
        onOpenLyrics={() => setShowLyrics(true)}
      />

      {/* Incoming Sing Together Request Prompt */}
      <SingTogetherInviteModal
        visible={!!activeSingTogetherInvite}
        initiatorName={activeSingTogetherInvite?.initiatorName || "Room Host"}
        trackTitle={activeSingTogetherInvite?.trackTitle || (currentTrack?.title || "Current Track")}
        onAccept={() => {
          const currentUser = user || { id: "user-me", username: "me", displayName: "You" };
          joinSingTogether({
            userId: currentUser.id,
            displayName: currentUser.displayName,
            avatarUrl: currentUser.avatarUrl,
          });
          setVoiceActive(true);
        }}
        onDecline={() => dismissSingTogetherInvite()}
      />
    </SafeAreaView>


  );
}

const styles = StyleSheet.create({
  quickToolsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  quickToolBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  quickToolText: {
    fontSize: 10,
    fontWeight: typography.weights.medium,
  },

  viewToggleContainer: {
    alignItems: "center",
    marginTop: spacing.xs,
  },
  viewTogglePill: {
    flexDirection: "row",
    padding: 3,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  viewToggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  viewToggleText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
  },

  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    height: 54,
    maxWidth: 880,
    width: "100%",
    alignSelf: "center",
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    alignItems: "center",
  },
  roomTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.tight,
  },
  liveMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 5,
  },
  roomSubtitle: {
    fontSize: typography.sizes.xs,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 60,
    maxWidth: 880,
    width: "100%",
    alignSelf: "center",
  },
  artworkContainer: {
    alignItems: "center",
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  artwork: {
    width: SCREEN_WIDTH - 96,
    height: SCREEN_WIDTH - 96,
    maxWidth: 290,
    maxHeight: 290,
    borderRadius: radii.xl,
  },
  trackInfo: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  trackTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.tight,
  },
  artistName: {
    fontSize: typography.sizes.sm,
    marginTop: 3,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 36,
    marginVertical: spacing.xs,
  },
  controlBtn: {
    padding: 8,
  },
  playPauseBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  listenersSection: {
    marginTop: spacing.md,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  listenerList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  memberPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  speakingIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  memberName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  reactionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: spacing.md,
    paddingVertical: spacing.xs,
  },
  reactionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  reactionText: {
    fontSize: 18,
  },
  superReactionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  subTabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    marginTop: spacing.xs,
  },
  subTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  subTabText: {
    fontSize: typography.sizes.xs,
    color: colors.light.textTertiary,
  },
  chatSection: {
    marginTop: spacing.sm,
  },
  messageFeed: {
    minHeight: 60,
    paddingVertical: 4,
    gap: 6,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  msgSender: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  msgContent: {
    fontSize: typography.sizes.xs,
  },
  chatInputRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 42,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    marginTop: 8,
  },
  chatTextInput: {
    flex: 1,
    fontSize: typography.sizes.xs,
    paddingHorizontal: 6,
  },
  sendBtn: {
    padding: 6,
  },

  // Voice Tab styles
  voiceSection: {
    marginTop: spacing.sm,
    gap: 16,
  },
  sfuStatusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  sfuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sfuText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  sfuMeta: {
    fontSize: 11,
  },
  voiceBlock: {
    gap: 8,
  },
  blockTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  blockLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.wider,
  },
  stageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  stageSpeakerCard: {
    width: (SCREEN_WIDTH - 48 - 20) / 3,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  avatarRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    position: "relative",
  },
  avatarLetter: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: "#FFFFFF",
  },
  speakingBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  speakerName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    textAlign: "center",
  },
  speakerRole: {
    fontSize: 10,
  },
  duckingProfilesList: {
    gap: 8,
  },
  duckingProfileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  profileTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  profileDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  voiceActionsRow: {
    marginTop: spacing.xs,
  },
  handRaiseBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  handRaiseText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },

  // Queue Tab styles
  queueSection: {
    marginTop: spacing.sm,
    gap: 12,
  },
  nowPlayingCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  queueThumb: {
    width: 42,
    height: 42,
    borderRadius: radii.sm,
  },
  nowPlayingInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  nowPlayingLabel: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    letterSpacing: typography.letterSpacing.wider,
  },
  nowPlayingTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  nowPlayingArtist: {
    fontSize: 11,
  },
  equalizerIndicator: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
    height: 18,
    paddingRight: 6,
  },
  eqBar: {
    width: 3,
    borderRadius: 1.5,
  },
  queueHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  addTrackBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  addTrackText: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
  },
  emptyQueue: {
    padding: spacing.lg,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: "center",
  },
  emptyText: {
    fontSize: typography.sizes.xs,
    textAlign: "center",
  },
  queueList: {
    gap: 8,
  },
  queueItemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  queueIndex: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    width: 22,
  },
  queueDetails: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  queueTrackTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  queueTrackArtist: {
    fontSize: 11,
  },
  queueAddedBy: {
    fontSize: 10,
    marginTop: 2,
  },
  queueActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  upvoteBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  upvoteCount: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
  },
  queueIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  // Push to talk
  pushToTalkSection: {
    marginTop: spacing.lg,
  },
  talkButton: {
    height: 48,
    borderRadius: radii.full,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  talkText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.tight,
  },
});
