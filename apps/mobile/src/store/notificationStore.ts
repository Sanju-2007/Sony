import { create } from "zustand";

export type NotificationType =
  | "FRIEND_REQUEST"
  | "ROOM_INVITE"
  | "SONG_DEDICATION"
  | "MILESTONE"
  | "SYSTEM";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  actionUrl?: string;
  data?: Record<string, any>;
}

interface NotificationState {
  notifications: AppNotification[];
  addNotification: (
    notif: Omit<AppNotification, "id" | "timestamp" | "read"> & {
      id?: string;
      timestamp?: string;
      read?: boolean;
    }
  ) => string;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  getUnreadCount: () => number;
}

const STORAGE_KEY = "sony_user_notifications";

const loadNotifications = (): AppNotification[] => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
  }
  return [];
};

const persistNotifications = (items: AppNotification[]) => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: loadNotifications(),

  addNotification: (notif) => {
    const id = notif.id || "notif-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
    const newNotif: AppNotification = {
      id,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      timestamp: notif.timestamp || "Just now",
      read: notif.read ?? false,
      actionLabel: notif.actionLabel,
      actionUrl: notif.actionUrl,
      data: notif.data,
    };

    set((state) => {
      const updated = [newNotif, ...state.notifications];
      persistNotifications(updated);
      return { notifications: updated };
    });

    return id;
  },

  markAsRead: (id) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      persistNotifications(updated);
      return { notifications: updated };
    });
  },

  markAllAsRead: () => {
    set((state) => {
      const updated = state.notifications.map((n) => ({ ...n, read: true }));
      persistNotifications(updated);
      return { notifications: updated };
    });
  },

  deleteNotification: (id) => {
    set((state) => {
      const updated = state.notifications.filter((n) => n.id !== id);
      persistNotifications(updated);
      return { notifications: updated };
    });
  },

  clearAll: () => {
    persistNotifications([]);
    set({ notifications: [] });
  },

  getUnreadCount: () => {
    return get().notifications.filter((n) => !n.read).length;
  },
}));
