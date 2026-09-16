import { SessionRecapEngine, ROOM_THEMES } from "@sony/music-core";
import { TrackMetadata, RoomThemeId, SongDedication, SuperReactionPayload } from "@sony/types";
import { RealtimeGateway } from "../src/modules/gateway/realtime.gateway";

describe("Phase 7: Song Dedications, Session Recap & Reactive Room Themes", () => {
  describe("1. Session Recap & Room Memories Engine", () => {
    const sampleTracks: TrackMetadata[] = [
      {
        id: "tr-01",
        provider: "LICENSED_CATALOG",
        providerTrackId: "p-01",
        title: "Blinding Lights",
        artist: "The Weeknd",
        album: "After Hours",
        artworkUrl: "art1",
        durationMs: 200000,
        genre: "Synthwave",
      },
      {
        id: "tr-02",
        provider: "LICENSED_CATALOG",
        providerTrackId: "p-02",
        title: "One More Time",
        artist: "Daft Punk",
        album: "Discovery",
        artworkUrl: "art2",
        durationMs: 210000,
        genre: "Synthwave",
      },
      {
        id: "tr-03",
        provider: "LICENSED_CATALOG",
        providerTrackId: "p-03",
        title: "Shibuya Sunset",
        artist: "Kaito & Maya",
        album: "Lo-Fi Nights",
        artworkUrl: "art3",
        durationMs: 180000,
        genre: "Lo-Fi",
      },
    ];

    it("aggregates listening stats and computes dominant genre accurately", () => {
      const recap = SessionRecapEngine.generateRecap({
        roomId: "room-test-1",
        roomName: "Late Night Beats",
        playedTracks: sampleTracks,
        durationMinutes: 90,
      });

      expect(recap.durationMinutes).toBe(90);
      expect(recap.totalTracksPlayed).toBeGreaterThanOrEqual(3);
      expect(recap.dominantGenre).toBe("Synthwave");
      expect(recap.genrePercentage).toBeGreaterThanOrEqual(66);
      expect(recap.averageBpm).toBe(124);
    });

    it("identifies highest upvoted track in the session", () => {
      const upvotesMap = {
        "tr-01": 2,
        "tr-02": 9, // Highest upvoted track
        "tr-03": 4,
      };

      const recap = SessionRecapEngine.generateRecap({
        roomId: "room-test-1",
        roomName: "Late Night Beats",
        playedTracks: sampleTracks,
        queueUpvotes: upvotesMap,
      });

      expect(recap.topUpvotedTrack.track.id).toBe("tr-02");
      expect(recap.topUpvotedTrack.track.title).toBe("One More Time");
      expect(recap.topUpvotedTrack.upvotes).toBe(9);
    });

    it("accurately crowns Chat MVP and Voice Champion based on activity", () => {
      const chatMessages = [
        { userId: "u-aisha", displayName: "Aisha" },
        { userId: "u-rahul", displayName: "Rahul" },
        { userId: "u-aisha", displayName: "Aisha" },
        { userId: "u-aisha", displayName: "Aisha" },
      ];

      const voiceStats = [
        { userId: "u-sanju", displayName: "Sanju", secondsSpoken: 1800 }, // 30m
        { userId: "u-rahul", displayName: "Rahul", secondsSpoken: 600 },  // 10m
      ];

      const recap = SessionRecapEngine.generateRecap({
        roomId: "room-test-1",
        roomName: "Late Night Beats",
        playedTracks: sampleTracks,
        chatMessages,
        voiceStats,
      });

      expect(recap.mvpChatter.displayName).toBe("Aisha");
      expect(recap.mvpChatter.messageCount).toBe(3);
      expect(recap.voiceChampion.displayName).toBe("Sanju");
      expect(recap.voiceChampion.minutesSpoken).toBe(30);
    });
  });

  describe("2. Reactive Room Themes Palette Integrity", () => {
    const themeIds: RoomThemeId[] = ["MONOCHROME", "CYBER_NEON", "SUNSET_ANALOG", "ARCTIC_AURORA"];

    it("provides the 4 curated ambient themes with complete color tokens", () => {
      themeIds.forEach((id) => {
        const theme = ROOM_THEMES[id];
        expect(theme).toBeDefined();
        expect(theme.id).toBe(id);
        expect(theme.name.length).toBeGreaterThan(0);
        expect(theme.background).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(theme.surface).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(theme.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(theme.textPrimary).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    it("verifies contrast: backgrounds are dark and textPrimary is light for night mode", () => {
      themeIds.forEach((id) => {
        const theme = ROOM_THEMES[id];
        // Background hex starts with 0 or 1 or 2 (dark tones)
        expect(parseInt(theme.background.substring(1, 3), 16)).toBeLessThan(50);
        // Primary text hex starts with higher lightness
        expect(parseInt(theme.textPrimary.substring(1, 3), 16)).toBeGreaterThan(200);
      });
    });
  });

  describe("3. Song Dedications Formatting", () => {
    it("structures a valid song dedication payload with custom badge style", () => {
      const dedication: SongDedication = {
        id: "ded-01",
        roomId: "room-01",
        trackId: "tr-01",
        fromUserId: "user-1",
        fromUserName: "Sanju",
        toUserName: "Aisha",
        message: "Dedicated to the best listening partner 🌅",
        badgeStyle: "GOLDEN",
        createdAt: new Date().toISOString(),
      };

      expect(dedication.fromUserName).toBe("Sanju");
      expect(dedication.toUserName).toBe("Aisha");
      expect(dedication.badgeStyle).toBe("GOLDEN");
      expect(dedication.message.length).toBeGreaterThan(5);
    });
  });

  describe("4. Realtime Gateway Broadcasts for Dedications & Super Reactions", () => {
    let gateway: RealtimeGateway;
    let mockServer: any;
    let mockSocket: any;

    beforeEach(() => {
      mockServer = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      };

      mockSocket = {
        data: { userId: "user-sanju", username: "Sanju" },
      };

      gateway = new RealtimeGateway(
        {} as any,
        {} as any,
        {} as any,
        {} as any,
        {} as any,
      );
      gateway.server = mockServer;
    });

    it("broadcasts dedication:new with sender info when dedication:send received", async () => {
      const dedicationData: SongDedication = {
        id: "ded-123",
        roomId: "room-party-1",
        trackId: "tr-01",
        fromUserId: "placeholder",
        fromUserName: "placeholder",
        toUserName: "Aisha",
        message: "This track reminds me of our trip!",
        badgeStyle: "NEON",
        createdAt: new Date().toISOString(),
      };

      await gateway.handleDedication(mockSocket as any, dedicationData);

      expect(mockServer.to).toHaveBeenCalledWith("room-party-1");
      expect(mockServer.emit).toHaveBeenCalledWith(
        "dedication:new",
        expect.objectContaining({
          id: "ded-123",
          fromUserId: "user-sanju",
          fromUserName: "Sanju",
          toUserName: "Aisha",
          badgeStyle: "NEON",
        }),
      );
    });

    it("broadcasts reaction:super_burst with sender info when reaction:super_burst received", async () => {
      const burstData: SuperReactionPayload = {
        roomId: "room-party-1",
        type: "DISCO_BLAST",
        userId: "placeholder",
        userName: "placeholder",
        timestamp: 0,
      };

      await gateway.handleSuperBurst(mockSocket as any, burstData);

      expect(mockServer.to).toHaveBeenCalledWith("room-party-1");
      expect(mockServer.emit).toHaveBeenCalledWith(
        "reaction:super_burst",
        expect.objectContaining({
          roomId: "room-party-1",
          type: "DISCO_BLAST",
          userId: "user-sanju",
          userName: "Sanju",
        }),
      );
    });
  });
});
