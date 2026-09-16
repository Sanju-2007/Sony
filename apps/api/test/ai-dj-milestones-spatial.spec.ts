import {
  AIDJEngine,
  AIDJ_PERSONAS,
  ListeningMilestoneTracker,
  SpatialAudioEngine,
} from "@sony/music-core";
import {
  TrackMetadata,
  AIDJPersona,
  AIDJAnnouncement,
  ListeningMilestone,
  SpatialSeat,
} from "@sony/types";
import { RealtimeGateway } from "../src/modules/gateway/realtime.gateway";

describe("Phase 8: AI Collaborative DJ, Group Milestones & 2D Spatial Audio Stage", () => {
  const sampleCurrentTrack: TrackMetadata = {
    id: "tr-cur-01",
    provider: "LICENSED_CATALOG",
    providerTrackId: "p-cur",
    title: "Midnight City",
    artist: "M83",
    album: "Hurry Up, We're Dreaming",
    artworkUrl: "https://example.com/art1.jpg",
    durationMs: 240000,
    genre: "Synth-Pop",
  };

  const sampleNextTrack: TrackMetadata = {
    id: "tr-next-02",
    provider: "LICENSED_CATALOG",
    providerTrackId: "p-next",
    title: "Instant Crush",
    artist: "Daft Punk ft. Julian Casablancas",
    album: "Random Access Memories",
    artworkUrl: "https://example.com/art2.jpg",
    durationMs: 337000,
    genre: "Electro-Pop",
  };

  describe("1. AI Collaborative DJ Engine", () => {
    const personas: AIDJPersona[] = [
      "LOFI_CHILL",
      "HYPE_BEAST",
      "CLUB_RESIDENT",
      "RADIO_HOST",
    ];

    it("has complete metadata and persona configurations for all 4 DJs", () => {
      personas.forEach((p) => {
        const meta = AIDJ_PERSONAS[p];
        expect(meta).toBeDefined();
        expect(meta.name.length).toBeGreaterThan(0);
        expect(meta.avatarEmoji).toBeDefined();
        expect(meta.samplePhrase.length).toBeGreaterThan(10);
      });
    });

    it("generates contextual transition drops for each persona mentioning requester", () => {
      personas.forEach((persona) => {
        const drop = AIDJEngine.generateTransitionAnnouncement({
          roomId: "room-dj-test",
          currentTrack: sampleCurrentTrack,
          nextTrack: sampleNextTrack,
          addedBy: "Aisha",
          persona,
        });

        expect(drop.roomId).toBe("room-dj-test");
        expect(drop.trackId).toBe("tr-next-02");
        expect(drop.persona).toBe(persona);
        expect(drop.introText).toContain("Instant Crush");
        expect(drop.introText).toContain("Daft Punk");
        expect(drop.introText).toContain("Aisha");
      });
    });

    it("recommends smart auto-fill tracks matching the dominant genre without duplicating played songs", () => {
      const catalogPool: TrackMetadata[] = [
        sampleCurrentTrack,
        sampleNextTrack,
        {
          id: "tr-rec-03",
          provider: "LICENSED_CATALOG",
          providerTrackId: "p-03",
          title: "Technologic",
          artist: "Daft Punk",
          album: "Human After All",
          artworkUrl: "art",
          durationMs: 280000,
          genre: "Electro-Pop",
        },
        {
          id: "tr-rec-04",
          provider: "LICENSED_CATALOG",
          providerTrackId: "p-04",
          title: "Coffee Break",
          artist: "Lo-Fi Collective",
          album: "Beats",
          artworkUrl: "art",
          durationMs: 150000,
          genre: "Lo-Fi",
        },
      ];

      const recommended = AIDJEngine.recommendNextTracks(
        [sampleCurrentTrack, sampleNextTrack],
        catalogPool,
        2,
      );

      expect(recommended).toHaveLength(2);
      expect(recommended.some((t) => t.id === "tr-cur-01")).toBe(false);
      expect(recommended.some((t) => t.id === "tr-next-02")).toBe(false);
      // tr-rec-03 has matching "Electro-Pop" genre so it should be prioritized first
      expect(recommended[0].id).toBe("tr-rec-03");
    });
  });

  describe("2. Group Listening Milestones & Streaks Engine", () => {
    it("evaluates milestone progress and detects newly unlocked achievements", () => {
      const { updatedMilestones, newlyUnlocked } =
        ListeningMilestoneTracker.evaluateMilestones({
          listeningMinutes: 20, // Reaches target 15 for m-sync-15
          tracksPlayedCount: 3, // Target 5 not reached yet
          maxTrackUpvotes: 12, // Reaches target 10 for m-anthem-10
        });

      expect(updatedMilestones).toHaveLength(4);

      const syncMilestone = updatedMilestones.find((m) => m.id === "m-sync-15");
      expect(syncMilestone?.achieved).toBe(true);
      expect(syncMilestone?.currentValue).toBe(20);

      const anthemMilestone = updatedMilestones.find(
        (m) => m.id === "m-anthem-10",
      );
      expect(anthemMilestone?.achieved).toBe(true);
      expect(anthemMilestone?.currentValue).toBe(12);

      const streakMilestone = updatedMilestones.find(
        (m) => m.id === "m-streak-5",
      );
      expect(streakMilestone?.achieved).toBe(false);
      expect(streakMilestone?.currentValue).toBe(3);

      expect(newlyUnlocked).toHaveLength(2);
      expect(newlyUnlocked.map((m) => m.id)).toEqual(
        expect.arrayContaining(["m-sync-15", "m-anthem-10"]),
      );
    });
  });

  describe("3. 2D Interactive Spatial Audio Engine", () => {
    it("calculates accurate stereo pan (-1.0 to +1.0) and distance attenuation gain", () => {
      // Dead center sweet spot
      const center = SpatialAudioEngine.calculateSpatialParameters(0, 0);
      expect(center.pan).toBe(0);
      expect(center.distanceGain).toBe(1.0);

      // Far left listener (-100, 0)
      const farLeft = SpatialAudioEngine.calculateSpatialParameters(-100, 0);
      expect(farLeft.pan).toBe(-1.0);
      expect(farLeft.distanceGain).toBeLessThan(1.0);

      // Far right listener (+100, 0)
      const farRight = SpatialAudioEngine.calculateSpatialParameters(100, 0);
      expect(farRight.pan).toBe(1.0);
      expect(farRight.distanceGain).toBeLessThan(1.0);

      // Distant diagonal listener (80, 80)
      const distant = SpatialAudioEngine.calculateSpatialParameters(80, 80);
      expect(distant.distanceGain).toBeGreaterThanOrEqual(0.25);
      expect(distant.distanceGain).toBeLessThan(0.7);
    });

    it("arranges room members in an evenly spaced circular stage geometry", () => {
      const members = [
        { userId: "u-1", displayName: "Sanju" },
        { userId: "u-2", displayName: "Aisha" },
        { userId: "u-3", displayName: "Rahul" },
        { userId: "u-4", displayName: "Priya" },
      ];

      const seats = SpatialAudioEngine.arrangeCircleSeats(members, 60);
      expect(seats).toHaveLength(4);

      seats.forEach((seat) => {
        expect(seat.pan).toBeGreaterThanOrEqual(-1.0);
        expect(seat.pan).toBeLessThanOrEqual(1.0);
        expect(seat.distanceGain).toBeGreaterThan(0.5);
      });

      // Top seat is at angle -pi/2 => x ~= 0, y = -60
      expect(Math.abs(seats[0].x)).toBeLessThanOrEqual(2);
      expect(seats[0].y).toBe(-60);
    });
  });

  describe("4. Realtime Gateway Broadcasts for Phase 8", () => {
    let gateway: RealtimeGateway;
    let mockServer: any;
    let mockSocket: any;

    beforeEach(() => {
      mockServer = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      };

      mockSocket = {
        data: { userId: "user-dj-host", username: "HostDJ" },
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

    it("broadcasts dj:announcement when dj:trigger_commentary is received", async () => {
      const announcement: AIDJAnnouncement = {
        id: "ann-01",
        roomId: "room-rave",
        trackId: "tr-01",
        trackTitle: "Midnight City",
        trackArtist: "M83",
        introText: "Testing drop",
        persona: "HYPE_BEAST",
        timestamp: Date.now(),
      };

      await gateway.handleDJCommentary(mockSocket as any, {
        roomId: "room-rave",
        announcement,
      });

      expect(mockServer.to).toHaveBeenCalledWith("room-rave");
      expect(mockServer.emit).toHaveBeenCalledWith(
        "dj:announcement",
        announcement,
      );
    });

    it("broadcasts milestone:unlocked when milestone:claim is received", async () => {
      const milestone: ListeningMilestone = {
        id: "m-sync-15",
        title: "15m Synchronized Vibe",
        description: "15 mins",
        icon: "✨",
        targetValue: 15,
        currentValue: 15,
        achieved: true,
        type: "SYNC_TIME",
      };

      await gateway.handleMilestoneClaim(mockSocket as any, {
        roomId: "room-rave",
        milestone,
      });

      expect(mockServer.to).toHaveBeenCalledWith("room-rave");
      expect(mockServer.emit).toHaveBeenCalledWith("milestone:unlocked", {
        roomId: "room-rave",
        milestone,
      });
    });

    it("broadcasts spatial:seats_updated when spatial:position_update is received", async () => {
      const seat: SpatialSeat = {
        userId: "placeholder",
        displayName: "HostDJ",
        x: 25,
        y: -40,
        pan: 0.25,
        distanceGain: 0.85,
      };

      await gateway.handleSpatialPosition(mockSocket as any, {
        roomId: "room-rave",
        seat,
      });

      expect(mockServer.to).toHaveBeenCalledWith("room-rave");
      expect(mockServer.emit).toHaveBeenCalledWith(
        "spatial:seats_updated",
        expect.objectContaining({
          roomId: "room-rave",
          seats: expect.arrayContaining([
            expect.objectContaining({
              userId: "user-dj-host",
              x: 25,
              y: -40,
              pan: 0.25,
            }),
          ]),
        }),
      );
    });
  });
});
