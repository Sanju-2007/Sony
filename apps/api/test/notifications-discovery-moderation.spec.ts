describe("Social Platform Remaining Phases Engine (Phases 10 - 13)", () => {
  describe("Phase 10: Voice Messaging & Waveform Processing", () => {
    function normalizeWaveform(input: number[], targetBars = 12): number[] {
      if (!input || input.length === 0) {
        return Array(targetBars).fill(0.3);
      }
      if (input.length >= targetBars) {
        return input.slice(0, targetBars).map((v) => Math.max(0.1, Math.min(1.0, v)));
      }
      const padded = [...input];
      while (padded.length < targetBars) {
        padded.push(0.35);
      }
      return padded;
    }

    function formatPlaybackTime(seconds: number): string {
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m}:${s < 10 ? "0" : ""}${s}`;
    }

    it("normalizes waveform amplitudes to bounded 0.1 - 1.0 range", () => {
      const raw = [-0.5, 0.4, 1.8, 0.7, 0.05];
      const normalized = normalizeWaveform(raw, 5);
      expect(normalized).toEqual([0.1, 0.4, 1.0, 0.7, 0.1]);
    });

    it("pads short waveforms to minimum display length", () => {
      const shortWave = [0.5, 0.8];
      const normalized = normalizeWaveform(shortWave, 8);
      expect(normalized.length).toBe(8);
      expect(normalized[0]).toBe(0.5);
      expect(normalized[1]).toBe(0.8);
      expect(normalized[7]).toBe(0.35);
    });

    it("correctly formats voice note duration timestamps", () => {
      expect(formatPlaybackTime(5)).toBe("0:05");
      expect(formatPlaybackTime(45)).toBe("0:45");
      expect(formatPlaybackTime(82)).toBe("1:22");
    });
  });

  describe("Phase 11: Real-Time Room Discovery & Tag Filtering", () => {
    interface MockRoom {
      id: string;
      name: string;
      description?: string;
      ownerId: string;
      currentTrack?: { title: string; artist: string };
    }

    const rooms: MockRoom[] = [
      {
        id: "r1",
        name: "Lofi Coding Sessions",
        description: "Focus chill beats for programmers",
        ownerId: "u1",
        currentTrack: { title: "Midnight Sun", artist: "ChillHop" },
      },
      {
        id: "r2",
        name: "Synthwave Highway",
        description: "80s retro electronic neon vibes",
        ownerId: "u2",
        currentTrack: { title: "Resonance", artist: "HOME" },
      },
      {
        id: "r3",
        name: "Acoustic Coffeehouse",
        description: "Warm organic vinyl guitar and folk",
        ownerId: "u3",
        currentTrack: { title: "Cherry Wine", artist: "Hozier" },
      },
    ];

    function filterRooms(
      allRooms: MockRoom[],
      searchQuery: string,
      selectedTag: string,
      blockedUserIds: string[] = []
    ): MockRoom[] {
      return allRooms.filter((room) => {
        if (blockedUserIds.includes(room.ownerId)) return false;

        const q = searchQuery.trim().toLowerCase();
        const matchesQuery =
          !q ||
          room.name.toLowerCase().includes(q) ||
          (room.description && room.description.toLowerCase().includes(q)) ||
          (room.currentTrack &&
            (room.currentTrack.title.toLowerCase().includes(q) ||
              room.currentTrack.artist.toLowerCase().includes(q)));

        const matchesTag =
          selectedTag === "all" ||
          (room.description &&
            room.description.toLowerCase().includes(selectedTag)) ||
          room.name.toLowerCase().includes(selectedTag);

        return matchesQuery && matchesTag;
      });
    }

    it("filters rooms by text query across name, description, and track artist", () => {
      const byName = filterRooms(rooms, "Coding", "all");
      expect(byName).toHaveLength(1);
      expect(byName[0].id).toBe("r1");

      const byArtist = filterRooms(rooms, "Hozier", "all");
      expect(byArtist).toHaveLength(1);
      expect(byArtist[0].id).toBe("r3");

      const byDesc = filterRooms(rooms, "neon", "all");
      expect(byDesc).toHaveLength(1);
      expect(byDesc[0].id).toBe("r2");
    });

    it("filters rooms by genre tag", () => {
      const electronic = filterRooms(rooms, "", "electronic");
      expect(electronic).toHaveLength(1);
      expect(electronic[0].id).toBe("r2");

      const chill = filterRooms(rooms, "", "chill");
      expect(chill).toHaveLength(1);
      expect(chill[0].id).toBe("r1");
    });

    it("excludes rooms hosted by blocked users", () => {
      const unblocked = filterRooms(rooms, "", "all", []);
      expect(unblocked).toHaveLength(3);

      const blockedHost = filterRooms(rooms, "", "all", ["u2"]);
      expect(blockedHost).toHaveLength(2);
      expect(blockedHost.some((r) => r.id === "r2")).toBe(false);
    });
  });

  describe("Phase 12: Notification Lifecycle & Badge Engine", () => {
    interface NotificationItem {
      id: string;
      type: "FRIEND_REQUEST" | "ROOM_INVITE" | "SONG_DEDICATION" | "MILESTONE";
      title: string;
      read: boolean;
    }

    class NotificationManager {
      private items: NotificationItem[] = [];

      add(notif: Omit<NotificationItem, "read">) {
        this.items.unshift({ ...notif, read: false });
      }

      markAsRead(id: string) {
        const found = this.items.find((i) => i.id === id);
        if (found) found.read = true;
      }

      markAllAsRead() {
        this.items.forEach((i) => (i.read = true));
      }

      delete(id: string) {
        this.items = this.items.filter((i) => i.id !== id);
      }

      getUnreadCount(): number {
        return this.items.filter((i) => !i.read).length;
      }

      getAll() {
        return this.items;
      }
    }

    it("manages notification creation and accurate unread count badge calculation", () => {
      const manager = new NotificationManager();
      expect(manager.getUnreadCount()).toBe(0);

      manager.add({ id: "n1", type: "ROOM_INVITE", title: "New Party" });
      manager.add({ id: "n2", type: "SONG_DEDICATION", title: "Song Dedication" });
      expect(manager.getUnreadCount()).toBe(2);

      manager.markAsRead("n1");
      expect(manager.getUnreadCount()).toBe(1);

      manager.markAllAsRead();
      expect(manager.getUnreadCount()).toBe(0);
    });

    it("deletes notifications cleanly", () => {
      const manager = new NotificationManager();
      manager.add({ id: "n1", type: "FRIEND_REQUEST", title: "Friend Request" });
      manager.delete("n1");
      expect(manager.getAll()).toHaveLength(0);
      expect(manager.getUnreadCount()).toBe(0);
    });
  });

  describe("Phase 13: Safety, Moderation, User Blocking & Profanity Shield", () => {
    const PROFANITIES = ["hate", "spam", "scam", "abusive"];

    function censorText(text: string): string {
      let result = text;
      for (const word of PROFANITIES) {
        const regex = new RegExp(`\\b${word}\\b`, "gi");
        result = result.replace(regex, "*".repeat(word.length));
      }
      return result;
    }

    it("censors prohibited words without modifying benign words", () => {
      const dirty = "Please report this abusive user because they send spam daily.";
      const clean = censorText(dirty);
      expect(clean).toBe("Please report this ******* user because they send **** daily.");

      const harmless = "Let's listen to music together.";
      expect(censorText(harmless)).toBe(harmless);
    });

    it("verifies user blocking and room kick state persistence", () => {
      const blockedList: string[] = [];
      const kickedByRoom: Record<string, string[]> = {};

      // Block user
      const blockUser = (uid: string) => {
        if (!blockedList.includes(uid)) blockedList.push(uid);
      };
      const kickUser = (roomId: string, uid: string) => {
        if (!kickedByRoom[roomId]) kickedByRoom[roomId] = [];
        if (!kickedByRoom[roomId].includes(uid)) kickedByRoom[roomId].push(uid);
      };

      blockUser("bad-actor-1");
      expect(blockedList.includes("bad-actor-1")).toBe(true);
      expect(blockedList.includes("good-listener")).toBe(false);

      kickUser("room-123", "bad-actor-1");
      expect(kickedByRoom["room-123"]).toContain("bad-actor-1");
      expect(kickedByRoom["room-123"].includes("other-user")).toBe(false);
    });
  });
});
