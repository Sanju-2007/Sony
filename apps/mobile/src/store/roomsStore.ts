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

const STORAGE_KEY = "sony_user_rooms";

const CURATED_DEFAULT_ROOMS: RoomDetails[] = [
  {
    id: "room-shibuya-midnight",
    name: "Shibuya Rain & Neon Beats",
    slug: "shibuya-rain-neon-beats",
    description: "Lo-Fi, chillhop, and smooth beats to relax, study, and code to.",
    type: "PUBLIC",
    ownerId: "user-host-kaito",
    maxParticipants: 50,
    participantCount: 8,
    status: "ACTIVE",
    currentTrack: {
      id: "track-lofi-02",
      provider: "LICENSED_CATALOG",
      providerTrackId: "track-lofi-02",
      title: "Tokyo Rain & Neon Lights",
      artist: "Kaito & Maya",
      album: "Shibuya Midnight",
      artworkUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&fit=crop&q=80",
      durationMs: 195000,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "room-ambient-sanctuary",
    name: "Ambient Waves & Cloudscapes",
    slug: "ambient-waves-cloudscapes",
    description: "Drift into weightless soundscapes and spatial textures with listeners worldwide.",
    type: "PUBLIC",
    ownerId: "user-host-aisha",
    maxParticipants: 35,
    participantCount: 5,
    status: "ACTIVE",
    currentTrack: {
      id: "track-ambient-01",
      provider: "LICENSED_CATALOG",
      providerTrackId: "track-ambient-01",
      title: "Midnight Ambient Waves",
      artist: "Sony Sound Collective",
      album: "Presence Vol. 1",
      artworkUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&fit=crop&q=80",
      durationMs: 240000,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "room-acoustic-lounge",
    name: "Acoustic Coffee & Warm Vinyl",
    slug: "acoustic-coffee-warm-vinyl",
    description: "Fingerpicked guitars, warm analog tape hiss, and intimate coffeehouse ballads.",
    type: "PUBLIC",
    ownerId: "user-host-elena",
    maxParticipants: 40,
    participantCount: 4,
    status: "ACTIVE",
    currentTrack: {
      id: "track-acoustic-03",
      provider: "LICENSED_CATALOG",
      providerTrackId: "track-acoustic-03",
      title: "Golden Hour Reverie",
      artist: "Elena Rostova",
      album: "Acoustic Sessions",
      artworkUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&fit=crop&q=80",
      durationMs: 210000,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const loadInitialRooms = (): RoomDetails[] => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Failed to load rooms from localStorage:", e);
    }
  }
  return CURATED_DEFAULT_ROOMS;
};

export const useRoomsStore = create<RoomsState>((set, get) => ({
  rooms: loadInitialRooms(),
  isLoading: false,

  fetchPublicRooms: async () => {
    set({ isLoading: true });
    try {
      const publicRooms = await api.getPublicRooms(30);
      if (publicRooms && Array.isArray(publicRooms) && publicRooms.length > 0) {
        // Merge fetched backend rooms with curated rooms (deduped by ID)
        const existingIds = new Set(publicRooms.map((r) => r.id));
        const customLocal = get().rooms.filter((r) => !existingIds.has(r.id) && !CURATED_DEFAULT_ROOMS.some((c) => c.id === r.id));
        const merged = [...publicRooms, ...customLocal];

        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        }
        set({ rooms: merged, isLoading: false });
        return;
      }
    } catch (err: any) {
      console.warn("Notice: public rooms sync falling back to cached/curated rooms:", err?.message);
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
