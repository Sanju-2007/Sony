import { create } from "zustand";
import { RoomDetails, TrackMetadata } from "@sony/types";
import { api } from "../services/apiClient";

interface RoomsState {
  rooms: RoomDetails[];
  isLoading: boolean;
  fetchPublicRooms: () => Promise<void>;
  createRoom: (room: RoomDetails) => Promise<void>;
  deleteRoom: (roomId: string) => void;
  updateRoomTrack: (roomId: string, track: TrackMetadata) => void;
  getRoomById: (roomId: string) => RoomDetails | undefined;
}

const STORAGE_KEY = "sony_user_rooms_v3";

const LEGACY_DEFAULT_ROOM_IDS = [
  "room-shibuya-midnight",
  "room-ambient-sanctuary",
  "room-acoustic-lounge",
];

const loadInitialRooms = (): RoomDetails[] => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.removeItem("sony_user_rooms");
      window.localStorage.removeItem("sony_user_rooms_v2");
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((r) => !LEGACY_DEFAULT_ROOM_IDS.includes(r.id));
        }
      }
    } catch (e) {
      console.warn("Failed to load rooms from localStorage:", e);
    }
  }
  return [];
};

export const useRoomsStore = create<RoomsState>((set, get) => ({
  rooms: loadInitialRooms(),
  isLoading: false,

  fetchPublicRooms: async () => {
    set({ isLoading: true });
    try {
      const publicRooms = await api.getPublicRooms(30);
      if (publicRooms && Array.isArray(publicRooms)) {
        const serverRooms = publicRooms.filter((r) => !LEGACY_DEFAULT_ROOM_IDS.includes(r.id));
        const serverIds = new Set(serverRooms.map((r) => r.id));
        const customLocal = get().rooms.filter(
          (r) => !serverIds.has(r.id) && !LEGACY_DEFAULT_ROOM_IDS.includes(r.id)
        );
        const merged = [...serverRooms, ...customLocal];

        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        }
        set({ rooms: merged, isLoading: false });
        return;
      }
    } catch (err: any) {
      console.warn("Notice: public rooms sync:", err?.message);
    }
    set({ isLoading: false });
  },

  createRoom: async (newRoom: RoomDetails) => {
    // 1. Optimistically add to store
    const updated = [newRoom, ...get().rooms.filter((r) => r.id !== newRoom.id)];
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    set({ rooms: updated });

    // 2. Dispatch creation to backend API if authenticated
    try {
      const created = await api.createRoom({
        name: newRoom.name,
        description: newRoom.description || undefined,
        type: newRoom.type as any,
      });
      if (created && created.id) {
        // Update room with authoritative server record
        const serverUpdated = get().rooms.map((r) => (r.id === newRoom.id ? { ...newRoom, ...created } : r));
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serverUpdated));
        }
        set({ rooms: serverUpdated });
      }
    } catch (apiErr: any) {
      console.warn("Notice: Room created locally with offline fallback:", apiErr?.message);
    }
  },

  deleteRoom: (roomId: string) => {
    const updated = get().rooms.filter((r) => r.id !== roomId);
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    set({ rooms: updated });
  },

  updateRoomTrack: (roomId: string, track: TrackMetadata) => {
    const updated = get().rooms.map((r) =>
      r.id === roomId ? { ...r, currentTrack: track, updatedAt: new Date().toISOString() } : r
    );
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    set({ rooms: updated });
  },

  getRoomById: (roomId: string) => {
    return get().rooms.find((r) => r.id === roomId);
  },
}));

// Trigger auto-sync on load
if (typeof window !== "undefined") {
  setTimeout(() => {
    useRoomsStore.getState().fetchPublicRooms();
  }, 100);
}
