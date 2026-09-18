import { create } from "zustand";

export interface FriendItem {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  status: "IN_ROOM" | "ONLINE" | "OFFLINE";
  currentTrack?: string;
  artist?: string;
  roomName?: string;
  roomId?: string;
}

export interface FriendRequestItem {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  mutualCount: number;
  message?: string;
}

export interface SentFriendRequest {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  sentAt: string;
}

interface SocialState {
  friends: FriendItem[];
  pendingRequests: FriendRequestItem[];
  sentRequests: Record<string, SentFriendRequest>;
  sentRoomInvites: Record<string, boolean>;

  addFriend: (friend: FriendItem) => void;
  removeFriend: (friendId: string) => void;
  sendRequest: (target: string | { id: string; name: string; handle: string; avatar?: string }) => void;
  cancelSentRequest: (userId: string) => void;
  recordRoomInvite: (roomId: string, friendId: string) => void;
  isRoomInviteSent: (roomId: string, friendId: string) => boolean;
  acceptRequest: (request: FriendRequestItem) => void;
  declineRequest: (requestId: string) => void;
  clearAll: () => void;
}

const FRIENDS_KEY = "sony_user_friends";
const REQUESTS_KEY = "sony_user_requests";
const SENT_REQUESTS_KEY = "sony_user_sent_requests";
const ROOM_INVITES_KEY = "sony_user_room_invites";

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(`Failed to load ${key} from localStorage:`, e);
    }
  }
  return defaultValue;
};

export const useSocialStore = create<SocialState>((set, get) => ({
  friends: loadFromStorage<FriendItem[]>(FRIENDS_KEY, []),
  pendingRequests: loadFromStorage<FriendRequestItem[]>(REQUESTS_KEY, []),
  sentRequests: loadFromStorage<Record<string, SentFriendRequest>>(SENT_REQUESTS_KEY, {}),
  sentRoomInvites: loadFromStorage<Record<string, boolean>>(ROOM_INVITES_KEY, {}),

  addFriend: (friend) => {
    const updated = [...get().friends.filter((f) => f.id !== friend.id), friend];
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(FRIENDS_KEY, JSON.stringify(updated));
    }
    // Also remove from sentRequests if present
    const updatedSent = { ...get().sentRequests };
    delete updatedSent[friend.id];
    delete updatedSent[friend.handle.replace(/^@/, "")];
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(SENT_REQUESTS_KEY, JSON.stringify(updatedSent));
    }
    set({ friends: updated, sentRequests: updatedSent });
  },

  removeFriend: (friendId) => {
    const updated = get().friends.filter((f) => f.id !== friendId);
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(FRIENDS_KEY, JSON.stringify(updated));
    }
    set({ friends: updated });
  },

  sendRequest: (target) => {
    let req: SentFriendRequest;
    if (typeof target === "string") {
      const clean = target.replace(/^@/, "");
      req = {
        id: "user-" + clean.toLowerCase(),
        name: clean.charAt(0).toUpperCase() + clean.slice(1),
        handle: "@" + clean.toLowerCase(),
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&fit=crop&q=80",
        sentAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
    } else {
      req = {
        id: target.id,
        name: target.name,
        handle: target.handle.startsWith("@") ? target.handle : "@" + target.handle,
        avatar: target.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&fit=crop&q=80",
        sentAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
    }

    const updated = {
      ...get().sentRequests,
      [req.id]: req,
      [req.handle.replace(/^@/, "").toLowerCase()]: req,
    };

    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(SENT_REQUESTS_KEY, JSON.stringify(updated));
    }
    set({ sentRequests: updated });
  },

  cancelSentRequest: (userId) => {
    const updated = { ...get().sentRequests };
    delete updated[userId];
    delete updated[userId.replace(/^@/, "").toLowerCase()];
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(SENT_REQUESTS_KEY, JSON.stringify(updated));
    }
    set({ sentRequests: updated });
  },

  recordRoomInvite: (roomId, friendId) => {
    const key = `${roomId}_${friendId}`;
    const updated = { ...get().sentRoomInvites, [key]: true };
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(ROOM_INVITES_KEY, JSON.stringify(updated));
    }
    set({ sentRoomInvites: updated });
  },

  isRoomInviteSent: (roomId, friendId) => {
    return !!get().sentRoomInvites[`${roomId}_${friendId}`];
  },

  acceptRequest: (request) => {
    const remainingRequests = get().pendingRequests.filter((r) => r.id !== request.id);
    const newFriend: FriendItem = {
      id: request.id,
      name: request.name,
      handle: request.handle,
      avatar: request.avatar,
      status: "ONLINE",
    };
    const updatedFriends = [...get().friends.filter((f) => f.id !== newFriend.id), newFriend];

    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(REQUESTS_KEY, JSON.stringify(remainingRequests));
      window.localStorage.setItem(FRIENDS_KEY, JSON.stringify(updatedFriends));
    }

    set({
      pendingRequests: remainingRequests,
      friends: updatedFriends,
    });
  },

  declineRequest: (requestId) => {
    const remainingRequests = get().pendingRequests.filter((r) => r.id !== requestId);
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(REQUESTS_KEY, JSON.stringify(remainingRequests));
    }
    set({ pendingRequests: remainingRequests });
  },

  clearAll: () => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(FRIENDS_KEY);
      window.localStorage.removeItem(REQUESTS_KEY);
      window.localStorage.removeItem(SENT_REQUESTS_KEY);
      window.localStorage.removeItem(ROOM_INVITES_KEY);
    }
    set({ friends: [], pendingRequests: [], sentRequests: {}, sentRoomInvites: {} });
  },
}));
