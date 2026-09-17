import { create } from "zustand";
import { colors } from "../theme/tokens";

export type ThemeMode = "light" | "dark";

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  palette: typeof colors.light;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

const getInitialMode = (): ThemeMode => {
  if (typeof window !== "undefined") {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const queryTheme = urlParams.get("theme");
      if (queryTheme === "light" || queryTheme === "dark") {
        if (window.localStorage) window.localStorage.setItem("sony_theme_mode", queryTheme);
        return queryTheme;
      }
      if (window.localStorage) {
        const saved = window.localStorage.getItem("sony_theme_mode") as ThemeMode | null;
        if (saved === "light" || saved === "dark") return saved;
      }
    } catch (e) {}
  }
  return "light";
};

const initialMode = getInitialMode();

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: initialMode,
  isDark: initialMode === "dark",
  palette: colors[initialMode],
  toggleTheme: () => {
    const nextMode: ThemeMode = get().mode === "light" ? "dark" : "light";
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem("sony_theme_mode", nextMode);
    }
    set({
      mode: nextMode,
      isDark: nextMode === "dark",
      palette: colors[nextMode],
    });
  },
  setMode: (nextMode: ThemeMode) => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem("sony_theme_mode", nextMode);
    }
    set({
      mode: nextMode,
      isDark: nextMode === "dark",
      palette: colors[nextMode],
    });
  },
}));
