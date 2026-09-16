import { create } from 'zustand';
import { PublicUser, AuthTokens } from '@sony/types';

interface AuthState {
  user: PublicUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  setAuth: (user: PublicUser, tokens: AuthTokens) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: 'user-preview-1',
    username: 'sanju',
    displayName: 'Sanju',
    avatarUrl: null,
    bio: 'Listening to synthwave & ambient beats',
    isPrivate: false,
  },
  tokens: {
    accessToken: 'preview-token',
    refreshToken: 'preview-refresh',
    expiresIn: 3600,
  },
  isAuthenticated: true,
  setAuth: (user, tokens) => set({ user, tokens, isAuthenticated: true }),
  logout: () => set({ user: null, tokens: null, isAuthenticated: false }),
}));
