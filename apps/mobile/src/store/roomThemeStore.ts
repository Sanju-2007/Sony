import { create } from "zustand";
import { RoomThemeId, RoomThemeConfig, SongDedication } from "@sony/types";
import { ROOM_THEMES } from "@sony/music-core";

interface RoomThemeState {
  activeThemeId: RoomThemeId;
  theme: RoomThemeConfig;
  dedications: SongDedication[];
  activeDedication: SongDedication | null;

  // Actions
  setTheme: (id: RoomThemeId) => void;
  addDedication: (dedication: SongDedication) => void;
  dismissDedication: () => void;
}

const SAMPLE_INITIAL_DEDICATION: SongDedication = {
  id: "dedication-initial-1",
  roomId: "room-late-night-1",
  trackId: "track-01",
  fromUserId: "user-2",
  fromUserName: "Aisha",
  toUserName: "Everyone in the Room",
  message: "Turn this up! Remembering our midnight rooftop hangout 🌃✨",
  badgeStyle: "NEON",
  createdAt: new Date().toISOString(),
};

export const useRoomThemeStore = create<RoomThemeState>((set) => ({
  activeThemeId: "MONOCHROME",
  theme: ROOM_THEMES.MONOCHROME,
  dedications: [SAMPLE_INITIAL_DEDICATION],
  activeDedication: SAMPLE_INITIAL_DEDICATION,

  setTheme: (id) => {
    const themeConfig = ROOM_THEMES[id] || ROOM_THEMES.MONOCHROME;
    set({
      activeThemeId: id,
      theme: themeConfig,
    });
  },

  addDedication: (dedication) => {
    set((state) => ({
      dedications: [dedication, ...state.dedications],
      activeDedication: dedication,
    }));
  },

  dismissDedication: () => {
    set({ activeDedication: null });
  },
}));
