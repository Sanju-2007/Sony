import { create } from "zustand";

export type ReportReason =
  | "HARASSMENT"
  | "SPAM_OR_SCAM"
  | "INAPPROPRIATE_MUSIC"
  | "HATE_SPEECH"
  | "OTHER";

export interface IncidentReport {
  id: string;
  targetType: "USER" | "ROOM" | "MESSAGE";
  targetId: string;
  targetName?: string;
  reason: ReportReason;
  details?: string;
  timestamp: string;
}

interface ModerationState {
  blockedUserIds: string[];
  reports: IncidentReport[];
  kickedUserIdsByRoom: Record<string, string[]>;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  isUserBlocked: (userId: string) => boolean;
  submitReport: (
    report: Omit<IncidentReport, "id" | "timestamp">
  ) => string;
  kickUserFromRoom: (roomId: string, userId: string) => void;
  isUserKickedFromRoom: (roomId: string, userId: string) => boolean;
  filterText: (text: string) => string;
}

const STORAGE_KEY = "sony_moderation_state";

const PROFANITY_LIST = [
  "hate",
  "spam",
  "scam",
  "abusive",
  "nazi",
  "kill",
  "slur",
];

const loadModerationState = (): {
  blockedUserIds: string[];
  reports: IncidentReport[];
  kickedUserIdsByRoom: Record<string, string[]>;
} => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
  }
  return { blockedUserIds: [], reports: [], kickedUserIdsByRoom: {} };
};

const persistState = (state: {
  blockedUserIds: string[];
  reports: IncidentReport[];
  kickedUserIdsByRoom: Record<string, string[]>;
}) => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }
};

const initial = loadModerationState();

export const useModerationStore = create<ModerationState>((set, get) => ({
  blockedUserIds: initial.blockedUserIds,
  reports: initial.reports,
  kickedUserIdsByRoom: initial.kickedUserIdsByRoom,

  blockUser: (userId: string) => {
    set((state) => {
      if (state.blockedUserIds.includes(userId)) return state;
      const updated = {
        ...state,
        blockedUserIds: [...state.blockedUserIds, userId],
      };
      persistState({
        blockedUserIds: updated.blockedUserIds,
        reports: updated.reports,
        kickedUserIdsByRoom: updated.kickedUserIdsByRoom,
      });
      return updated;
    });
  },

  unblockUser: (userId: string) => {
    set((state) => {
      const updated = {
        ...state,
        blockedUserIds: state.blockedUserIds.filter((id) => id !== userId),
      };
      persistState({
        blockedUserIds: updated.blockedUserIds,
        reports: updated.reports,
        kickedUserIdsByRoom: updated.kickedUserIdsByRoom,
      });
      return updated;
    });
  },

  isUserBlocked: (userId: string) => {
    return get().blockedUserIds.includes(userId);
  },

  submitReport: (report) => {
    const id = "rep-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
    const newReport: IncidentReport = {
      ...report,
      id,
      timestamp: new Date().toISOString(),
    };

    set((state) => {
      const updated = {
        ...state,
        reports: [newReport, ...state.reports],
      };
      persistState({
        blockedUserIds: updated.blockedUserIds,
        reports: updated.reports,
        kickedUserIdsByRoom: updated.kickedUserIdsByRoom,
      });
      return updated;
    });

    return id;
  },

  kickUserFromRoom: (roomId: string, userId: string) => {
    set((state) => {
      const current = state.kickedUserIdsByRoom[roomId] || [];
      if (current.includes(userId)) return state;
      const updatedMap = {
        ...state.kickedUserIdsByRoom,
        [roomId]: [...current, userId],
      };
      const updated = {
        ...state,
        kickedUserIdsByRoom: updatedMap,
      };
      persistState({
        blockedUserIds: updated.blockedUserIds,
        reports: updated.reports,
        kickedUserIdsByRoom: updated.kickedUserIdsByRoom,
      });
      return updated;
    });
  },

  isUserKickedFromRoom: (roomId: string, userId: string) => {
    const kicked = get().kickedUserIdsByRoom[roomId];
    return !!kicked && kicked.includes(userId);
  },

  filterText: (text: string) => {
    if (!text) return "";
    let cleaned = text;
    for (const badWord of PROFANITY_LIST) {
      const reg = new RegExp(`\\b${badWord}\\b`, "gi");
      cleaned = cleaned.replace(reg, "*".repeat(badWord.length));
    }
    return cleaned;
  },
}));
