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

interface SocialState {
  friends: FriendItem[];
  pendingRequests: FriendRequestItem[];
  sentRequests: Record<string, boolean>;

  addFriend: (friend: FriendItem) => void;
  removeFriend: (friendId: string) => void;
  sendRequest: (userId: string) => void;
  acceptRequest: (request: FriendRequestItem) => void;
  declineRequest: (requestId: string) => void;
  clearAll: () => void;
}

const FRIENDS_KEY = "sony_user_friends";
const REQUESTS_KEY = "sony_user_requests";

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
  sentRequests: {},

  addFriend: (friend) => {
    const updated = [...get().friends.filter((f) => f.id !== friend.id), friend];
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(FRIENDS_KEY, JSON.stringify(updated));
    }
    set({ friends: updated });
  },

  removeFriend: (friendId) => {
    const updated = get().friends.filter((f) => f.id !== friendId);
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(FRIENDS_KEY, JSON.stringify(updated));
    }
    set({ friends: updated });
  },

  sendRequest: (userId) => {
    set((s) => ({ sentRequests: { ...s.sentRequests, [userId]: true } }));
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
    }
    set({ friends: [], pendingRequests: [], sentRequests: {} });
  },
}));
