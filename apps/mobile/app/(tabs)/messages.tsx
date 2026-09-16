import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Mic,
  MessageSquare,
  Play,
  Pause,
  Send,
  ChevronLeft,
  Disc,
  MoreVertical,
} from "lucide-react-native";
import { typography, colors, spacing, radii } from "../../src/theme/tokens";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface VoiceMessageItem {
  id: string;
  sender: "me" | "them";
  durationSec: number;
  waveform: number[]; // normalized heights 0.2 to 1.0
  createdAt: string;
  isVoice: true;
}

interface TextMessageItem {
  id: string;
  sender: "me" | "them";
  text: string;
  createdAt: string;
  isVoice: false;
}

type MessageItem = VoiceMessageItem | TextMessageItem;

interface ChatThread {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  listeningTo?: string;
  unread: number;
  messages: MessageItem[];
}

export default function MessagesScreen() {
  const palette = colors.light;

  const [threads, setThreads] = useState<ChatThread[]>([
    {
      id: "c1",
      name: "Rahul",
      handle: "@rahul",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop&q=80",
      listeningTo: "Tokyo Rain & Neon Lights",
      unread: 1,
      messages: [
        {
          id: "m1",
          sender: "them",
          text: "Yo Sanju! Did you check out the new track in the room?",
          createdAt: "10:30 PM",
          isVoice: false,
        },
        {
          id: "m2",
          sender: "them",
          durationSec: 16,
          waveform: [0.3, 0.6, 0.9, 0.4, 0.8, 1.0, 0.7, 0.5, 0.8, 0.6, 0.4, 0.9, 0.5, 0.3],
          createdAt: "10:32 PM",
          isVoice: true,
        },
        {
          id: "m3",
          sender: "me",
          text: "Yeah the audio ducking is so crisp! Volume dips perfectly when speaking.",
          createdAt: "10:34 PM",
          isVoice: false,
        },
      ],
    },
    {
      id: "c2",
      name: "Aisha",
      handle: "@aisha",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&q=80",
      listeningTo: "Blinding Lights",
      unread: 0,
      messages: [
        {
          id: "m4",
          sender: "them",
          text: "Are you joining the late night room?",
          createdAt: "9:15 PM",
          isVoice: false,
        },
        {
          id: "m5",
          sender: "me",
          text: "Jumping in right now!",
          createdAt: "9:20 PM",
          isVoice: false,
        },
      ],
    },
  ]);

  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  const [inputText, setInputText] = useState("");
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState(0); // 0 to 1
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const recordingIntervalRef = useRef<any>(null);
  const playbackIntervalRef = useRef<any>(null);

  // Playback timer simulator
  useEffect(() => {
    if (playingVoiceId) {
      setPlaybackProgress(0);
      playbackIntervalRef.current = setInterval(() => {
        setPlaybackProgress((prev) => {
          if (prev >= 1) {
            clearInterval(playbackIntervalRef.current);
            setPlayingVoiceId(null);
            return 0;
          }
          return prev + 0.08;
        });
      }, 300);
    } else {
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
    }
    return () => {
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
    };
  }, [playingVoiceId]);

  // Voice recording simulator
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    }
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, [isRecording]);

  const handleSendText = () => {
    if (!inputText.trim() || !activeThread) return;
    const newMsg: TextMessageItem = {
      id: "msg-" + Date.now(),
      sender: "me",
      text: inputText.trim(),
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isVoice: false,
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThread.id ? { ...t, messages: [...t.messages, newMsg] } : t
      )
    );
    setActiveThread((prev) => (prev ? { ...prev, messages: [...prev.messages, newMsg] } : null));
    setInputText("");
  };

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    if (!isRecording || !activeThread) return;
    setIsRecording(false);
    const duration = Math.max(1, recordingSeconds);

    // Generate dynamic waveform
    const randomWave = Array.from({ length: 14 }, () =>
      Number((Math.random() * 0.7 + 0.3).toFixed(2))
    );

    const newVoiceMsg: VoiceMessageItem = {
      id: "voice-" + Date.now(),
      sender: "me",
      durationSec: duration,
      waveform: randomWave,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isVoice: true,
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThread.id ? { ...t, messages: [...t.messages, newVoiceMsg] } : t
      )
    );
    setActiveThread((prev) =>
      prev ? { ...prev, messages: [...prev.messages, newVoiceMsg] } : null
    );
    setRecordingSeconds(0);
  };

  const togglePlayVoice = (id: string) => {
    if (playingVoiceId === id) {
      setPlayingVoiceId(null);
    } else {
      setPlayingVoiceId(id);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: palette.textTertiary }]}>· direct</Text>
          <Text style={[styles.mainTitle, { color: palette.textPrimary }]}>Messages</Text>
        </View>

        <View style={styles.list}>
          {threads.map((c) => {
            const lastMsg = c.messages[c.messages.length - 1];
            return (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.chatCard,
                  { backgroundColor: palette.surface, borderColor: palette.borderSubtle },
                ]}
                onPress={() => setActiveThread(c)}
              >
                <Image source={{ uri: c.avatar }} style={styles.avatar} />
                <View style={styles.info}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.name, { color: palette.textPrimary }]}>{c.name}</Text>
                    <Text style={[styles.time, { color: palette.textTertiary }]}>{lastMsg?.createdAt}</Text>
                  </View>
                  <View style={styles.msgRow}>
                    {lastMsg?.isVoice ? (
                      <>
                        <Mic size={12} color={palette.duckingIndicator} style={{ marginRight: 4 }} />
                        <Text style={[styles.lastMsg, { color: palette.textSecondary }]}>
                          Voice note ({lastMsg.durationSec}s)
                        </Text>
                      </>
                    ) : (
                      <Text style={[styles.lastMsg, { color: palette.textSecondary }]} numberOfLines={1}>
                        {lastMsg?.text}
                      </Text>
                    )}
                  </View>
                  {c.listeningTo && (
                    <View style={styles.listeningTag}>
                      <Disc size={10} color={palette.textTertiary} style={{ marginRight: 4 }} />
                      <Text style={[styles.listeningText, { color: palette.textTertiary }]} numberOfLines={1}>
                        Listening to {c.listeningTo}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* ACTIVE CONVERSATION MODAL */}
      <Modal visible={!!activeThread} animationType="slide" onRequestClose={() => setActiveThread(null)}>
        {activeThread && (
          <SafeAreaView style={[styles.chatModalContainer, { backgroundColor: palette.background }]} edges={["top", "bottom"]}>
            {/* Conversation Header */}
            <View style={[styles.modalHeader, { borderBottomColor: palette.borderSubtle }]}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setActiveThread(null)}>
                <ChevronLeft size={24} color={palette.textPrimary} />
              </TouchableOpacity>

              <Image source={{ uri: activeThread.avatar }} style={styles.modalAvatar} />

              <View style={styles.modalTitleBox}>
                <Text style={[styles.modalName, { color: palette.textPrimary }]}>{activeThread.name}</Text>
                <Text style={[styles.modalStatus, { color: palette.speaking }]}>
                  ● Online · Listening to {activeThread.listeningTo || "Music"}
                </Text>
              </View>

              <TouchableOpacity style={styles.moreBtn}>
                <MoreVertical size={18} color={palette.textTertiary} />
              </TouchableOpacity>
            </View>

            {/* Messages Feed */}
            <ScrollView contentContainerStyle={styles.feedContent} showsVerticalScrollIndicator={false}>
              {activeThread.messages.map((msg) => {
                const isMe = msg.sender === "me";
                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageBubbleWrapper,
                      isMe ? styles.bubbleMeWrapper : styles.bubbleThemWrapper,
                    ]}
                  >
                    {msg.isVoice ? (
                      // Voice Message Player Card
                      <View
                        style={[
                          styles.voiceMessageBubble,
                          {
                            backgroundColor: isMe ? palette.textPrimary : palette.surface,
                            borderColor: palette.borderSubtle,
                          },
                        ]}
                      >
                        <TouchableOpacity
                          style={[
                            styles.voicePlayBtn,
                            { backgroundColor: isMe ? palette.surface : palette.textPrimary },
                          ]}
                          onPress={() => togglePlayVoice(msg.id)}
                        >
                          {playingVoiceId === msg.id ? (
                            <Pause size={14} color={isMe ? palette.textPrimary : "#FFFFFF"} />
                          ) : (
                            <Play size={14} color={isMe ? palette.textPrimary : "#FFFFFF"} style={{ marginLeft: 2 }} />
                          )}
                        </TouchableOpacity>

                        {/* Waveform Bars */}
                        <View style={styles.waveformContainer}>
                          {msg.waveform.map((bar, i) => {
                            const barProgress = i / msg.waveform.length;
                            const isPlayed = playingVoiceId === msg.id && playbackProgress >= barProgress;
                            return (
                              <View
                                key={i}
                                style={[
                                  styles.waveBar,
                                  {
                                    height: Math.round(bar * 24),
                                    backgroundColor: isMe
                                      ? isPlayed
                                        ? palette.speaking
                                        : "rgba(255,255,255,0.4)"
                                      : isPlayed
                                      ? palette.speaking
                                      : palette.border,
                                  },
                                ]}
                              />
                            );
                          })}
                        </View>

                        <Text
                          style={[
                            styles.voiceDurationText,
                            { color: isMe ? "rgba(255,255,255,0.7)" : palette.textTertiary },
                          ]}
                        >
                          {msg.durationSec}s
                        </Text>
                      </View>
                    ) : (
                      // Standard Text Bubble
                      <View
                        style={[
                          styles.textBubble,
                          {
                            backgroundColor: isMe ? palette.textPrimary : palette.surface,
                            borderColor: palette.borderSubtle,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.bubbleText,
                            { color: isMe ? "#FFFFFF" : palette.textPrimary },
                          ]}
                        >
                          {msg.text}
                        </Text>
                      </View>
                    )}

                    <Text style={[styles.bubbleTime, { color: palette.textTertiary }]}>
                      {msg.createdAt}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>

            {/* Recording Active Banner */}
            {isRecording && (
              <View style={[styles.recordingBanner, { backgroundColor: palette.duckingIndicator }]}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>
                  Recording voice note... 0:0{recordingSeconds} · Release to send
                </Text>
              </View>
            )}

            {/* Input Row */}
            <View style={[styles.modalInputRow, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Message or hold mic to speak..."
                placeholderTextColor={palette.textTertiary}
                style={[styles.modalTextInput, { color: palette.textPrimary }]}
                onSubmitEditing={handleSendText}
              />

              {inputText.trim().length > 0 ? (
                <TouchableOpacity style={styles.actionIconButton} onPress={handleSendText}>
                  <Send size={18} color={palette.textPrimary} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[
                    styles.actionIconButton,
                    isRecording && { backgroundColor: palette.duckingIndicator, borderRadius: 18 },
                  ]}
                  onPressIn={handleStartRecording}
                  onPressOut={handleStopRecording}
                >
                  <Mic size={18} color={isRecording ? "#FFFFFF" : palette.textPrimary} />
                </TouchableOpacity>
              )}
            </View>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: 40 },
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
  list: { gap: spacing.sm },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  avatar: { width: 46, height: 46, borderRadius: 23 },
  info: { flex: 1, marginLeft: spacing.md },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium },
  time: { fontSize: typography.sizes.xs },
  msgRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  lastMsg: { fontSize: typography.sizes.xs },
  listeningTag: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  listeningText: {
    fontSize: 10,
  },

  // Modal styles
  chatModalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    height: 58,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 6,
    marginRight: 4,
  },
  modalAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  modalTitleBox: {
    flex: 1,
  },
  modalName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  modalStatus: {
    fontSize: 10,
    marginTop: 2,
  },
  moreBtn: {
    padding: 6,
  },
  feedContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 12,
  },
  messageBubbleWrapper: {
    gap: 4,
  },
  bubbleMeWrapper: {
    alignItems: "flex-end",
  },
  bubbleThemWrapper: {
    alignItems: "flex-start",
  },
  textBubble: {
    maxWidth: "80%",
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  bubbleText: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
  bubbleTime: {
    fontSize: 10,
    paddingHorizontal: 4,
  },

  // Voice message styling
  voiceMessageBubble: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: 10,
    minWidth: 190,
  },
  voicePlayBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    height: 28,
  },
  waveBar: {
    width: 3,
    borderRadius: 1.5,
  },
  voiceDurationText: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    marginLeft: 4,
  },

  // Input row
  modalInputRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderWidth: 1,
    borderRadius: radii.full,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  modalTextInput: {
    flex: 1,
    fontSize: typography.sizes.sm,
  },
  actionIconButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  recordingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 32,
    gap: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  recordingText: {
    color: "#FFFFFF",
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
});
