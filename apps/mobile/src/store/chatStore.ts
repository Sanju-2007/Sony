import { create } from "zustand";

export interface VoiceMessageItem {
  id: string;
  sender: "me" | "them";
  durationSec: number;
  waveform: number[];
  createdAt: string;
  isVoice: true;
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
    const existing = get().threads.find((t) => t.id === recipient.id || t.handle === recipient.handle);
    if (existing) {
      set({ activeThreadId: existing.id });
      return existing.id;
    }

    const newThread: ChatThread = {
      id: recipient.id,
      name: recipient.name,
      handle: recipient.handle,
      avatar: recipient.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&fit=crop&q=80",
      unread: 0,
      messages: [],
    };

    const updated = [newThread, ...get().threads];
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(CHAT_KEY, JSON.stringify(updated));
    }
    set({ threads: updated, activeThreadId: newThread.id });
    return newThread.id;
  },

  sendMessage: (threadId, text) => {
    const newMsg: TextMessageItem = {
      id: "msg-" + Date.now(),
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
  },

  sendVoiceNote: (threadId, durationSec, waveform) => {
    const newVoice: VoiceMessageItem = {
      id: "voice-" + Date.now(),
      sender: "me",
      durationSec,
      waveform,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isVoice: true,
    };

    const updated = get().threads.map((t) =>
      t.id === threadId ? { ...t, messages: [...t.messages, newVoice] } : t
    );

    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(CHAT_KEY, JSON.stringify(updated));
    }
    set({ threads: updated });
  },

  setActiveThreadId: (id) => set({ activeThreadId: id }),

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
