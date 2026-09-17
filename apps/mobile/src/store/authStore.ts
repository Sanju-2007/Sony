import { create } from 'zustand';
import { PublicUser, AuthTokens } from '@sony/types';

interface AuthState {
  user: PublicUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  setAuth: (user: PublicUser, tokens?: AuthTokens) => void;
  updateProfile: (updates: Partial<PublicUser>) => void;
  logout: () => void;
}

const USER_STORAGE_KEY = 'sony_user_profile';

const loadSavedUser = (): PublicUser | null => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(USER_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load user profile from localStorage:', e);
    }
  }
  return null;
};

const initialUser = loadSavedUser();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialUser,
  tokens: initialUser
    ? {
        accessToken: 'session-token-' + initialUser.id,
        refreshToken: 'session-refresh-' + initialUser.id,
        expiresIn: 3600 * 24,
      }
    : null,
  isAuthenticated: !!initialUser,

  setAuth: (user, tokens) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
    set({
      user,
      tokens: tokens || {
        accessToken: 'token-' + user.id,
        refreshToken: 'refresh-' + user.id,
        expiresIn: 3600 * 24,
      },
      isAuthenticated: true,
    });
  },

  updateProfile: (updates) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...updates };
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
    }
    set({ user: updated });
  },

  logout: () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(USER_STORAGE_KEY);
    }
    set({ user: null, tokens: null, isAuthenticated: false });
  },
}));
