import { create } from "zustand";
import { RoomDetails, TrackMetadata } from "@sony/types";

interface RoomsState {
  rooms: RoomDetails[];
  createRoom: (room: RoomDetails) => void;
  deleteRoom: (roomId: string) => void;
  updateRoomTrack: (roomId: string, track: TrackMetadata) => void;
  getRoomById: (roomId: string) => RoomDetails | undefined;
}

const STORAGE_KEY = "sony_user_rooms";

const loadInitialRooms = (): RoomDetails[] => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Failed to load rooms from localStorage:", e);
    }
  }
  return [];
};

export const useRoomsStore = create<RoomsState>((set, get) => ({
  rooms: loadInitialRooms(),

  createRoom: (newRoom: RoomDetails) => {
    const updated = [newRoom, ...get().rooms.filter((r) => r.id !== newRoom.id)];
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    set({ rooms: updated });
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
