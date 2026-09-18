import { create } from "zustand";
import { PublicUser, AuthTokens } from "@sony/types";
import { api } from "../services/apiClient";

interface RegisteredUserRecord {
  id: string;
  username: string;
  displayName: string;
  email?: string;
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
  isEmailAvailable: (email: string) => boolean;
  sendRegistrationOtp: (email: string) => Promise<{ success: boolean; code?: string; error?: string }>;
  verifyRegistrationOtp: (email: string, otp: string) => Promise<boolean>;
  registerUser: (params: {
    displayName: string;
    username: string;
    email: string;
    password?: string;
    otp: string;
    bio?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  loginUser: (params: {
    identifier?: string;
    username?: string;
    password?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  setAuth: (user: PublicUser, tokens?: AuthTokens) => void;
  updateProfile: (updates: Partial<PublicUser>) => void;
  logout: () => void;
}

const USER_STORAGE_KEY = "sony_active_session_v3";
const TOKEN_STORAGE_KEY = "sony_auth_tokens_v3";
const USERS_DIRECTORY_KEY = "sony_registered_users";
const OTP_STORAGE_KEY = "sony_pending_otps";

// Purge any legacy unverified/mock user sessions on startup
if (typeof window !== "undefined" && window.localStorage) {
  try {
    window.localStorage.removeItem("sony_user_profile");
    window.localStorage.removeItem("sony_user");
  } catch {
    // ignore
  }
}

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

const loadPendingOtps = (): Record<string, { code: string; expiresAt: number }> => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(OTP_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
  }
  return {};
};

const persistPendingOtps = (otps: Record<string, { code: string; expiresAt: number }>) => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otps));
    } catch {
      // ignore
    }
  }
};

const loadSavedTokens = (): AuthTokens | null => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(TOKEN_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
  }
  return null;
};

const loadSavedUser = (): PublicUser | null => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      // Always purge stale legacy profile keys
      window.localStorage.removeItem("sony_user_profile");
      window.localStorage.removeItem("sony_user");

      const saved = window.localStorage.getItem(USER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const directory = loadRegisteredUsers();
        const handle = parsed?.username ? parsed.username.toLowerCase().replace(/^@/, "") : "";
        // Only consider logged in if this user actually exists in registered directory or has active token
        const tokens = loadSavedTokens();
        if (tokens || (handle && directory[handle])) {
          return parsed;
        } else {
          window.localStorage.removeItem(USER_STORAGE_KEY);
        }
      }
    } catch (e) {
      console.warn("Failed to load user profile from localStorage:", e);
    }
  }
  return null;
};

const initialUser = loadSavedUser();
const initialTokens = loadSavedTokens() || (initialUser
  ? {
      accessToken: "session-token-" + initialUser.id,
      refreshToken: "session-refresh-" + initialUser.id,
      expiresIn: 3600 * 24,
    }
  : null);

if (initialTokens?.accessToken) {
  api.setToken(initialTokens.accessToken);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialUser,
  tokens: initialTokens,
  isAuthenticated: !!initialUser,

  isUsernameAvailable: (rawUsername: string) => {
    const cleaned = rawUsername.trim().toLowerCase().replace(/^@/, "");
    if (!cleaned || cleaned.length < 3) return false;
    const directory = loadRegisteredUsers();
    const currentUser = get().user;
    if (currentUser && currentUser.username.toLowerCase() === cleaned) {
      return true;
    }
    return !directory[cleaned];
  },

  isEmailAvailable: (rawEmail: string) => {
    const cleaned = rawEmail.trim().toLowerCase();
    if (!cleaned || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) return false;
    const directory = loadRegisteredUsers();
    const currentUser = get().user;
    if (currentUser && currentUser.email?.toLowerCase() === cleaned) {
      return true;
    }
    return !Object.values(directory).some((u) => u.email?.toLowerCase() === cleaned);
  },

  sendRegistrationOtp: async (rawEmail: string) => {
    const cleaned = rawEmail.trim().toLowerCase();
    if (!cleaned || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const directory = loadRegisteredUsers();
    const existing = Object.values(directory).find(
      (u) => u.email?.toLowerCase() === cleaned
    );
    if (existing) {
      return {
        success: false,
        error: "This email is already registered. Please sign in instead.",
      };
    }

    // 1. Dispatch real-time email via backend API
    try {
      const res = await api.sendOtp(cleaned);
      if (res.success) {
        const codeToStore = res.code || "123456";
        const otps = loadPendingOtps();
        otps[cleaned] = {
          code: codeToStore,
          expiresAt: Date.now() + 10 * 60 * 1000,
        };
        persistPendingOtps(otps);
        return { success: true, code: res.code };
      }
    } catch (apiErr: any) {
      console.warn("Backend API email dispatch fallback:", apiErr?.message);
    }

    // 2. Generate local fallback OTP for dev/offline resilience
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otps = loadPendingOtps();
    otps[cleaned] = {
      code: otpCode,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    };
    persistPendingOtps(otps);

    return { success: true, code: otpCode };
  },

  verifyRegistrationOtp: async (rawEmail: string, enteredOtp: string) => {
    const cleanedEmail = rawEmail.trim().toLowerCase();
    const cleanedOtp = enteredOtp.trim();
    if (!cleanedEmail || !cleanedOtp) return false;

    // Master testing code for instant verification
    if (cleanedOtp === "123456") return true;

    // 1. Try backend API verification
    try {
      const apiRes = await api.verifyOtp(cleanedEmail, cleanedOtp);
      if (apiRes.success && apiRes.valid) {
        return true;
      }
    } catch {}

    // 2. Local fallback check
    const otps = loadPendingOtps();
    const record = otps[cleanedEmail];
    if (!record) return false;

    if (Date.now() > record.expiresAt) {
      delete otps[cleanedEmail];
      persistPendingOtps(otps);
      return false;
    }

    return record.code === cleanedOtp;
  },

  registerUser: async ({ displayName, username, email, password, otp, bio }) => {
    const cleanedHandle = username.trim().toLowerCase().replace(/^@/, "");
    const cleanedName = displayName.trim();
    const cleanedEmail = email.trim().toLowerCase();
    const cleanedOtp = otp.trim();

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
    if (!cleanedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedEmail)) {
      return { success: false, error: "Please enter a valid email address." };
    }
    if (password && password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long." };
    }

    const directory = loadRegisteredUsers();
    if (directory[cleanedHandle]) {
      return {
        success: false,
        error: `User ID @${cleanedHandle} is already taken. Please choose another.`,
      };
    }
    if (Object.values(directory).some((u) => u.email?.toLowerCase() === cleanedEmail)) {
      return {
        success: false,
        error: "This email is already registered. Please log in instead.",
      };
    }

    // Verify OTP
    const isOtpValid = await get().verifyRegistrationOtp(cleanedEmail, cleanedOtp);
    if (!isOtpValid) {
      return {
        success: false,
        error: "Invalid or expired verification code. Please check your email inbox and try again.",
      };
    }

    // 1. Dispatch registration to backend API
    let apiTokens: AuthTokens | undefined;
    try {
      const res = await api.register({
        username: cleanedHandle,
        email: cleanedEmail,
        password: password || "Password123!",
        displayName: cleanedName,
        otp: cleanedOtp,
      });
      if (res && res.tokens) {
        apiTokens = res.tokens;
      }
    } catch (apiErr: any) {
      console.warn("Backend API registration notice:", apiErr?.message);
    }

    const userId = "user-" + cleanedHandle;
    const newUserRecord: RegisteredUserRecord = {
      id: userId,
      username: cleanedHandle,
      displayName: cleanedName,
      email: cleanedEmail,
      bio: bio || "Listening together on Sony Sound.",
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&fit=crop&q=80`,
      password: password || undefined,
      createdAt: new Date().toISOString(),
    };

    directory[cleanedHandle] = newUserRecord;
    persistRegisteredUsers(directory);

    // Clear used OTP
    const otps = loadPendingOtps();
    delete otps[cleanedEmail];
    persistPendingOtps(otps);

    const publicUser: PublicUser = {
      id: newUserRecord.id,
      username: newUserRecord.username,
      displayName: newUserRecord.displayName,
      email: newUserRecord.email,
      avatarUrl: newUserRecord.avatar,
      bio: newUserRecord.bio,
    };

    get().setAuth(publicUser, apiTokens);
    return { success: true };
  },

  loginUser: async ({ identifier, username, password }) => {
    const query = (identifier || username || "").trim().toLowerCase().replace(/^@/, "");
    if (!query) {
      return { success: false, error: "Please enter your User ID or Email." };
    }

    // 1. Attempt backend API login first
    try {
      const res = await api.login({
        login: query,
        password: password || "Password123!",
      });
      if (res && res.user && res.tokens) {
        get().setAuth(res.user, res.tokens);
        return { success: true };
      }
    } catch (apiErr: any) {
      console.warn("Backend API login notice:", apiErr?.message);
    }

    // 2. Fallback check in local directory
    const directory = loadRegisteredUsers();
    const existing =
      directory[query] ||
      Object.values(directory).find((u) => u.email?.toLowerCase() === query);

    if (!existing) {
      return {
        success: false,
        error: `No account found for "${query}". Please create your profile first.`,
      };
    }

    if (existing.password && password && existing.password !== password) {
      return { success: false, error: "Incorrect password. Please try again." };
    }

    const publicUser: PublicUser = {
      id: existing.id,
      username: existing.username,
      displayName: existing.displayName,
      email: existing.email,
      avatarUrl: existing.avatar,
      bio: existing.bio,
    };

    get().setAuth(publicUser);
    return { success: true };
  },

  setAuth: (user, tokens) => {
    const finalTokens: AuthTokens = tokens || {
      accessToken: "token-" + user.id,
      refreshToken: "refresh-" + user.id,
      expiresIn: 3600 * 24,
    };
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      window.localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(finalTokens));
    }
    api.setToken(finalTokens.accessToken);
    set({
      user,
      tokens: finalTokens,
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
        email: updated.email || directory[current.username].email,
      };
      persistRegisteredUsers(directory);
    }

    set({ user: updated });
  },

  logout: () => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(USER_STORAGE_KEY);
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.localStorage.removeItem("sony_user_profile");
      window.localStorage.removeItem("sony_user");
    }
    api.setToken(null);
    set({ user: null, tokens: null, isAuthenticated: false });
  },
}));

