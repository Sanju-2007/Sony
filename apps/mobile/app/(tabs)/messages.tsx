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
import { typography, spacing, radii } from "../../src/theme/tokens";
import { useThemeStore } from "../../src/store/themeStore";
import { ThemeToggleButton } from "../../src/components/theme/ThemeToggleButton";

import { Plus, UserPlus, X, Search } from "lucide-react-native";
import { useChatStore, ChatThread } from "../../src/store/chatStore";
import { useSocialStore } from "../../src/store/socialStore";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function MessagesScreen() {
  const { palette, isDark } = useThemeStore();
  const { threads, startConversation, sendMessage, sendVoiceNote } = useChatStore();
  const { friends } = useSocialStore();

  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [customRecipient, setCustomRecipient] = useState("");
  const [inputText, setInputText] = useState("");
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState(0); // 0 to 1
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const recordingIntervalRef = useRef<any>(null);
  const playbackIntervalRef = useRef<any>(null);

  const activeThread = threads.find((t) => t.id === activeThreadId) || null;

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
    sendMessage(activeThread.id, inputText.trim());
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

    sendVoiceNote(activeThread.id, duration, randomWave);
    setRecordingSeconds(0);
  };

  const handleStartWithFriend = (f: { id: string; name: string; handle: string; avatar: string }) => {
    const threadId = startConversation(f);
    setActiveThreadId(threadId);
    setShowNewChatModal(false);
  };

  const handleStartCustom = () => {
    if (!customRecipient.trim()) return;
    const name = customRecipient.trim().replace(/^@/, "");
    const threadId = startConversation({
      id: "recipient-" + Date.now(),
      name: name.charAt(0).toUpperCase() + name.slice(1),
      handle: "@" + name.toLowerCase(),
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&fit=crop&q=80",
    });
    setCustomRecipient("");
    setActiveThreadId(threadId);
    setShowNewChatModal(false);
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
        <View style={[styles.header, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
          <View>
            <Text style={[styles.eyebrow, { color: palette.textTertiary }]}>· direct</Text>
            <Text style={[styles.mainTitle, { color: palette.textPrimary }]}>Messages</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <ThemeToggleButton />
            <TouchableOpacity
              style={[styles.newChatBtn, { backgroundColor: palette.accent }]}
              onPress={() => setShowNewChatModal(true)}
            >
              <Plus size={16} color={palette.accentInverted} style={{ marginRight: 4 }} />
              <Text style={[styles.newChatBtnText, { color: palette.accentInverted }]}>New</Text>
            </TouchableOpacity>
          </View>
        </View>

        {threads.length === 0 ? (
          <View style={[styles.emptyInboxCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <MessageSquare size={28} color={palette.accent} style={{ marginBottom: 10 }} />
            <Text style={[styles.emptyInboxTitle, { color: palette.textPrimary }]}>No messages yet</Text>
            <Text style={[styles.emptyInboxSubtitle, { color: palette.textSecondary }]}>
              Chat directly or send synchronized voice notes to friends while listening together.
            </Text>
            <TouchableOpacity
              style={[styles.emptyInboxBtn, { backgroundColor: palette.accent }]}
              onPress={() => setShowNewChatModal(true)}
            >
              <Plus size={15} color={palette.accentInverted} style={{ marginRight: 6 }} />
              <Text style={[styles.emptyInboxBtnText, { color: palette.accentInverted }]}>Start Conversation</Text>
            </TouchableOpacity>
          </View>
        ) : (
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
                  onPress={() => setActiveThreadId(c.id)}
                >
                  <Image source={{ uri: c.avatar }} style={styles.avatar} />
                  <View style={styles.info}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.name, { color: palette.textPrimary }]}>{c.name}</Text>
                      <Text style={[styles.time, { color: palette.textTertiary }]}>{lastMsg?.createdAt || ""}</Text>
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
                          {lastMsg?.text || "No messages yet"}
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
        )}
      </ScrollView>

      {/* NEW CONVERSATION MODAL */}
      <Modal visible={showNewChatModal} animationType="slide" transparent onRequestClose={() => setShowNewChatModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.newChatSheet, { backgroundColor: palette.background }]}>
            <View style={styles.newChatHeader}>
              <Text style={[styles.newChatTitle, { color: palette.textPrimary }]}>Start a Conversation</Text>
              <TouchableOpacity onPress={() => setShowNewChatModal(false)}>
                <X size={20} color={palette.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: palette.textSecondary, marginBottom: 12 }}>
              Choose a friend or type a recipient's handle to message directly:
            </Text>

            <View style={[styles.searchBox, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              <Search size={16} color={palette.textTertiary} style={{ marginRight: 8 }} />
              <TextInput
                value={customRecipient}
                onChangeText={setCustomRecipient}
                placeholder="Enter handle or name..."
                placeholderTextColor={palette.textTertiary}
                style={[styles.searchInput, { color: palette.textPrimary }]}
                onSubmitEditing={handleStartCustom}
              />
            </View>

            {customRecipient.trim().length > 0 && (
              <TouchableOpacity
                style={[styles.startCustomBtn, { backgroundColor: palette.accent }]}
                onPress={handleStartCustom}
              >
                <Plus size={15} color={palette.accentInverted} style={{ marginRight: 6 }} />
                <Text style={[styles.startCustomBtnText, { color: palette.accentInverted }]}>
                  Message @{customRecipient.trim().replace(/^@/, "")}
                </Text>
              </TouchableOpacity>
            )}

            {friends.length > 0 && (
              <View style={{ marginTop: spacing.md }}>
                <Text style={[styles.friendsListLabel, { color: palette.textTertiary }]}>YOUR FRIENDS</Text>
                {friends.map((f) => (
                  <TouchableOpacity
                    key={f.id}
                    style={[styles.friendPickRow, { backgroundColor: palette.surface, borderColor: palette.borderSubtle }]}
                    onPress={() => handleStartWithFriend(f)}
                  >
                    <Image source={{ uri: f.avatar }} style={styles.friendPickAvatar} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.friendPickName, { color: palette.textPrimary }]}>{f.name}</Text>
                      <Text style={[styles.friendPickHandle, { color: palette.textTertiary }]}>{f.handle}</Text>
                    </View>
                    <MessageSquare size={16} color={palette.accent} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ACTIVE CONVERSATION MODAL */}
      <Modal visible={!!activeThread} animationType="slide" onRequestClose={() => setActiveThreadId(null)}>
        {activeThread && (
          <SafeAreaView style={[styles.chatModalContainer, { backgroundColor: palette.background }]} edges={["top", "bottom"]}>
            {/* Conversation Header */}
            <View style={[styles.modalHeader, { borderBottomColor: palette.borderSubtle }]}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setActiveThreadId(null)}>
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
                            backgroundColor: isMe ? palette.accent : palette.surface,
                            borderColor: palette.borderSubtle,
                          },
                        ]}
                      >
                        <TouchableOpacity
                          style={[
                            styles.voicePlayBtn,
                            { backgroundColor: isMe ? palette.accentInverted : palette.accent },
                          ]}
                          onPress={() => togglePlayVoice(msg.id)}
                        >
                          {playingVoiceId === msg.id ? (
                            <Pause size={14} color={isMe ? palette.accent : palette.accentInverted} />
                          ) : (
                            <Play size={14} color={isMe ? palette.accent : palette.accentInverted} style={{ marginLeft: 2 }} />
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
                                        : isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)"
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
                            { color: isMe ? (isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)") : palette.textTertiary },
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
                            backgroundColor: isMe ? palette.accent : palette.surface,
                            borderColor: palette.borderSubtle,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.bubbleText,
                            { color: isMe ? palette.accentInverted : palette.textPrimary },
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
  newChatBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  newChatBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  emptyInboxCard: {
    padding: spacing.xl,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  emptyInboxTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptyInboxSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    maxWidth: 360,
    marginBottom: spacing.md,
  },
  emptyInboxBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: 10,
  },
  emptyInboxBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  newChatSheet: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  newChatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  newChatTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.sm,
  },
  startCustomBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  startCustomBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  friendsListLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
  },
  friendPickRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: 8,
  },
  friendPickAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  friendPickName: {
    fontSize: 13,
    fontWeight: "600",
  },
  friendPickHandle: {
    fontSize: 11,
  },
});
