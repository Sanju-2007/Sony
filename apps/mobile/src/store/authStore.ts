import { create } from "zustand";
import { PublicUser, AuthTokens } from "@sony/types";

interface RegisteredUserRecord {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  password?: string;
  createdAt: string;
}

interface AuthState {
  user: PublicUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isUsernameAvailable: (username: string) => boolean;
  registerUser: (params: {
    displayName: string;
    username: string;
    password?: string;
    bio?: string;
  }) => { success: boolean; error?: string };
  loginUser: (params: {
    username: string;
    password?: string;
  }) => { success: boolean; error?: string };
  setAuth: (user: PublicUser, tokens?: AuthTokens) => void;
  updateProfile: (updates: Partial<PublicUser>) => void;
  logout: () => void;
}

const USER_STORAGE_KEY = "sony_user_profile";
const USERS_DIRECTORY_KEY = "sony_registered_users";

const loadSavedUser = (): PublicUser | null => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(USER_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to load user profile from localStorage:", e);
    }
  }
  return null;
};

const loadRegisteredUsers = (): Record<string, RegisteredUserRecord> => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(USERS_DIRECTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
  }
  return {};
};

const persistRegisteredUsers = (users: Record<string, RegisteredUserRecord>) => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(USERS_DIRECTORY_KEY, JSON.stringify(users));
    } catch {
      // ignore
    }
  }
};

const initialUser = loadSavedUser();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialUser,
  tokens: initialUser
    ? {
        accessToken: "session-token-" + initialUser.id,
        refreshToken: "session-refresh-" + initialUser.id,
        expiresIn: 3600 * 24,
      }
    : null,
  isAuthenticated: !!initialUser,

  isUsernameAvailable: (rawUsername: string) => {
    const cleaned = rawUsername.trim().toLowerCase().replace(/^@/, "");
    if (!cleaned || cleaned.length < 3) return false;
    const directory = loadRegisteredUsers();
    // If current logged-in user already owns it, it's valid for them
    const currentUser = get().user;
    if (currentUser && currentUser.username.toLowerCase() === cleaned) {
      return true;
    }
    return !directory[cleaned];
  },

  registerUser: ({ displayName, username, password, bio }) => {
    const cleanedHandle = username.trim().toLowerCase().replace(/^@/, "");
    const cleanedName = displayName.trim();

    if (!cleanedName) {
      return { success: false, error: "Please enter your full name." };
    }
    if (!cleanedHandle || cleanedHandle.length < 3) {
      return {
        success: false,
        error: "User ID must be at least 3 characters long.",
      };
    }
    if (!/^[a-z0-9_]+$/.test(cleanedHandle)) {
      return {
        success: false,
        error: "User ID can only contain letters, numbers, and underscores.",
      };
    }

    const directory = loadRegisteredUsers();
    if (directory[cleanedHandle]) {
      return {
        success: false,
        error: `User ID @${cleanedHandle} is already taken. Please choose another.`,
      };
    }

    const userId = "user-" + cleanedHandle;
    const newUserRecord: RegisteredUserRecord = {
      id: userId,
      username: cleanedHandle,
      displayName: cleanedName,
      bio: bio || "Listening together on Sony Sound.",
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&fit=crop&q=80`,
      password: password || undefined,
      createdAt: new Date().toISOString(),
    };

    directory[cleanedHandle] = newUserRecord;
    persistRegisteredUsers(directory);

    const publicUser: PublicUser = {
      id: newUserRecord.id,
      username: newUserRecord.username,
      displayName: newUserRecord.displayName,
      avatarUrl: newUserRecord.avatar,
      bio: newUserRecord.bio,
    };

    get().setAuth(publicUser);
    return { success: true };
  },

  loginUser: ({ username, password }) => {
    const cleanedHandle = username.trim().toLowerCase().replace(/^@/, "");
    if (!cleanedHandle) {
      return { success: false, error: "Please enter your User ID." };
    }

    const directory = loadRegisteredUsers();
    const existing = directory[cleanedHandle];

    if (!existing) {
      return {
        success: false,
        error: `No profile found for @${cleanedHandle}. Please create your profile first.`,
      };
    }

    if (existing.password && password && existing.password !== password) {
      return { success: false, error: "Incorrect password. Please try again." };
    }

    const publicUser: PublicUser = {
      id: existing.id,
      username: existing.username,
      displayName: existing.displayName,
      avatarUrl: existing.avatar,
      bio: existing.bio,
    };

    get().setAuth(publicUser);
    return { success: true };
  },

  setAuth: (user, tokens) => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
    set({
      user,
      tokens: tokens || {
        accessToken: "token-" + user.id,
        refreshToken: "refresh-" + user.id,
        expiresIn: 3600 * 24,
      },
      isAuthenticated: true,
    });
  },

  updateProfile: (updates) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...updates };

    // Update in local user session
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
    }

    // Update in directory
    const directory = loadRegisteredUsers();
    if (directory[current.username]) {
      directory[current.username] = {
        ...directory[current.username],
        displayName: updated.displayName || directory[current.username].displayName,
        bio: updated.bio || directory[current.username].bio,
        avatar: updated.avatarUrl || directory[current.username].avatar,
      };
      persistRegisteredUsers(directory);
    }

    set({ user: updated });
  },

  logout: () => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(USER_STORAGE_KEY);
    }
    set({ user: null, tokens: null, isAuthenticated: false });
  },
}));
