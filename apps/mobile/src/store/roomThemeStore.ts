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

export const useRoomThemeStore = create<RoomThemeState>((set) => ({
  activeThemeId: "MONOCHROME",
  theme: ROOM_THEMES.MONOCHROME,
  dedications: [],
  activeDedication: null,

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
