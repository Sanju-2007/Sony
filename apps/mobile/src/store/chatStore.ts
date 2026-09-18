import { create } from "zustand";
import { socketService } from "../services/socketService";
import { api } from "../services/apiClient";
import { useAuthStore } from "./authStore";

export interface VoiceMessageItem {
  id: string;
  sender: "me" | "them";
  durationSec: number;
  waveform: number[];
  createdAt: string;
  isVoice: true;
  text?: string;
}

export interface TextMessageItem {
  id: string;
  sender: "me" | "them";
  text: string;
  createdAt: string;
  isVoice: false;
}

export type MessageItem = VoiceMessageItem | TextMessageItem;

export interface ChatThread {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  listeningTo?: string;
  unread: number;
  messages: MessageItem[];
}

interface ChatState {
  threads: ChatThread[];
  activeThreadId: string | null;
  startConversation: (recipient: { id: string; name: string; handle: string; avatar: string }) => string;
  sendMessage: (threadId: string, text: string) => void;
  sendVoiceNote: (threadId: string, durationSec: number, waveform: number[]) => void;
  receiveDirectMessage: (data: any) => void;
  loadThreadHistory: (threadId: string) => Promise<void>;
  setActiveThreadId: (id: string | null) => void;
  deleteThread: (threadId: string) => void;
}

const CHAT_KEY = "sony_user_chats";

const loadThreads = (): ChatThread[] => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(CHAT_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to load chats from localStorage:", e);
    }
  }
  return [];
};

export const useChatStore = create<ChatState>((set, get) => ({
  threads: loadThreads(),
  activeThreadId: null,

  startConversation: (recipient) => {
    const existing = get().threads.find(
      (t) => t.id === recipient.id || (recipient.handle && t.handle.toLowerCase() === recipient.handle.toLowerCase())
    );
    if (existing) {
      set({ activeThreadId: existing.id });
      // Fetch backend message history
      get().loadThreadHistory(existing.id);
      return existing.id;
    }

    const newThread: ChatThread = {
      id: recipient.id,
      name: recipient.name,
      handle: recipient.handle.startsWith("@") ? recipient.handle : `@${recipient.handle}`,
      avatar: recipient.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&fit=crop&q=80",
      unread: 0,
      messages: [],
    };

    const updated = [newThread, ...get().threads];
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(CHAT_KEY, JSON.stringify(updated));
    }
    set({ threads: updated, activeThreadId: newThread.id });
    get().loadThreadHistory(newThread.id);
    return newThread.id;
  },

  sendMessage: (threadId, text) => {
    const thread = get().threads.find((t) => t.id === threadId);
    const msgId = "msg-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
    const newMsg: TextMessageItem = {
      id: msgId,
      sender: "me",
      text,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isVoice: false,
    };

    const updated = get().threads.map((t) =>
      t.id === threadId ? { ...t, messages: [...t.messages, newMsg] } : t
    );

    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(CHAT_KEY, JSON.stringify(updated));
    }
    set({ threads: updated });

    // 1. Send via WebSocket Gateway in real time
    const targetUsername = thread?.handle ? thread.handle.replace(/^@/, "") : undefined;
    socketService.sendDirectMessage({
      recipientId: thread?.id,
      recipientUsername: targetUsername,
      content: text,
      type: "TEXT",
    });

    // 2. Persist via REST API in background
    api.sendDirectMessage(thread?.id || threadId, text, "TEXT").catch((err) => {
      console.warn("Direct message REST fallback notice:", err.message);
    });
  },

  sendVoiceNote: (threadId, durationSec, waveform) => {
    const thread = get().threads.find((t) => t.id === threadId);
    const msgId = "voice-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
    const newVoice: VoiceMessageItem = {
      id: msgId,
      sender: "me",
      durationSec,
      waveform,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isVoice: true,
      text: "[Voice Message]",
    };

    const updated = get().threads.map((t) =>
      t.id === threadId ? { ...t, messages: [...t.messages, newVoice] } : t
    );

    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(CHAT_KEY, JSON.stringify(updated));
    }
    set({ threads: updated });

    const targetUsername = thread?.handle ? thread.handle.replace(/^@/, "") : undefined;
    socketService.sendDirectMessage({
      recipientId: thread?.id,
      recipientUsername: targetUsername,
      content: "[Voice Message]",
      type: "VOICE",
      durationSec,
      waveform,
    });
  },

  receiveDirectMessage: (data) => {
    const authState = useAuthStore.getState();
    const currentUser = authState.user;
    const currentUserId = currentUser?.id;
    const currentUsername = currentUser?.username;

    // Check if this message was sent by me
    const isMine =
      (currentUserId && data.senderId === currentUserId) ||
      (currentUsername && data.senderUsername === currentUsername);

    // If sent by me, the counterpart is the recipient; otherwise counterpart is the sender
    const counterpartId = isMine ? data.recipientId : data.senderId;
    const counterpartUsername = isMine ? data.recipientUsername : data.senderUsername;
    const counterpartDisplayName = isMine
      ? data.recipientUsername || "Friend"
      : data.senderDisplayName || data.senderUsername || "Friend";
    const counterpartAvatar = isMine
      ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&fit=crop&q=80"
      : data.senderAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&fit=crop&q=80";

    const currentThreads = [...get().threads];
    let threadIndex = currentThreads.findIndex(
      (t) =>
        t.id === counterpartId ||
        (counterpartUsername && t.handle.toLowerCase() === `@${counterpartUsername}`.toLowerCase())
    );

    // If thread does not exist yet, dynamically create it
    if (threadIndex === -1) {
      const newThread: ChatThread = {
        id: counterpartId || `user-${counterpartUsername}`,
        name: counterpartDisplayName,
        handle: counterpartUsername ? (counterpartUsername.startsWith("@") ? counterpartUsername : `@${counterpartUsername}`) : "@user",
        avatar: counterpartAvatar,
        unread: isMine ? 0 : 1,
        messages: [],
      };
      currentThreads.unshift(newThread);
      threadIndex = 0;
    }

    const targetThread = currentThreads[threadIndex];

    // Deduplicate
    const msgExists = targetThread.messages.some(
      (m) =>
        m.id === data.id ||
        (m.text === data.content && m.sender === (isMine ? "me" : "them"))
    );
    if (msgExists) {
      return;
    }

    const newMsg: MessageItem =
      data.type === "VOICE"
        ? {
            id: data.id || `msg-${Date.now()}`,
            sender: isMine ? "me" : "them",
            durationSec: data.durationSec || 5,
            waveform: data.waveform || [0.2, 0.5, 0.8, 0.4],
            createdAt: new Date(data.createdAt || Date.now()).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            isVoice: true,
            text: "[Voice Message]",
          }
        : {
            id: data.id || `msg-${Date.now()}`,
            sender: isMine ? "me" : "them",
            text: data.content,
            createdAt: new Date(data.createdAt || Date.now()).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            isVoice: false,
          };

    const isCurrentlyActive = get().activeThreadId === targetThread.id;
    const updatedThread: ChatThread = {
      ...targetThread,
      unread: isCurrentlyActive || isMine ? 0 : targetThread.unread + 1,
      messages: [...targetThread.messages, newMsg],
    };

    const remainingThreads = currentThreads.filter((_, i) => i !== threadIndex);
    const updatedList = [updatedThread, ...remainingThreads];

    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(CHAT_KEY, JSON.stringify(updatedList));
    }
    set({ threads: updatedList });
  },

  loadThreadHistory: async (threadId) => {
    try {
      const messages = await api.getDirectMessages(threadId);
      if (Array.isArray(messages) && messages.length > 0) {
        set((state) => {
          const thread = state.threads.find((t) => t.id === threadId);
          if (!thread) return state;

          const backendFormatted: MessageItem[] = messages.map((m: any): MessageItem =>
            m.type === "VOICE"
              ? {
                  id: m.id,
                  sender: m.isMine ? ("me" as const) : ("them" as const),
                  durationSec: m.durationSec || 5,
                  waveform: m.waveform || [0.3, 0.6, 0.9, 0.4],
                  createdAt: new Date(m.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  isVoice: true as const,
                  text: "[Voice Message]",
                }
              : {
                  id: m.id,
                  sender: m.isMine ? ("me" as const) : ("them" as const),
                  text: m.content,
                  createdAt: new Date(m.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  isVoice: false as const,
                }
          );

          const seen = new Set<string>();
          const combined: MessageItem[] = [];

          for (const m of [...thread.messages, ...backendFormatted]) {
            if (!seen.has(m.id)) {
              seen.add(m.id);
              combined.push(m);
            }
          }

          const updated = state.threads.map((t) =>
            t.id === threadId ? { ...t, messages: combined } : t
          );

          if (typeof window !== "undefined" && window.localStorage) {
            window.localStorage.setItem(CHAT_KEY, JSON.stringify(updated));
          }
          return { threads: updated };
        });
      }
    } catch (e: any) {
      console.warn("Could not load backend thread history:", e.message);
    }
  },

  setActiveThreadId: (id) => {
    set({ activeThreadId: id });
    if (id) {
      get().loadThreadHistory(id);
    }
  },

  deleteThread: (threadId) => {
    const updated = get().threads.filter((t) => t.id !== threadId);
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(CHAT_KEY, JSON.stringify(updated));
    }
    set({
      threads: updated,
      activeThreadId: get().activeThreadId === threadId ? null : get().activeThreadId,
    });
  },
}));
