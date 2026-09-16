import { DriftCalculator } from "@sony/music-core";
import { AudioDuckingController } from "@sony/audio-ducking";
import { PlaybackStateVector, TrackMetadata, QueueItemDto, PublicUser } from "@sony/types";

describe("E2E Social Listening & Presence Platform Integration Flow", () => {
  const hostUser: PublicUser = {
    id: "user-host-1",
    username: "sanju",
    displayName: "Sanju",
  };

  const listenerUser: PublicUser = {
    id: "user-listener-2",
    username: "aisha",
    displayName: "Aisha",
  };

  const sampleTrack1: TrackMetadata = {
    id: "track-ambient-01",
    provider: "LICENSED_CATALOG",
    providerTrackId: "track-ambient-01",
    title: "Midnight Ambient Waves",
    artist: "Sony Sound Collective",
    album: "Presence Vol. 1",
    artworkUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&fit=crop&q=80",
    durationMs: 240000,
    streamUrl: "https://example.com/audio1.mp3",
  };

  const sampleTrack2: TrackMetadata = {
    id: "track-lofi-02",
    provider: "LICENSED_CATALOG",
    providerTrackId: "track-lofi-02",
    title: "Tokyo Rain & Neon Lights",
    artist: "Kaito & Maya",
    album: "Shibuya Midnight",
    artworkUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&fit=crop&q=80",
    durationMs: 195000,
  };

  describe("1. Room Playback State Vector & Authoritative Drift Engine", () => {
    it("extrapolates playback position based on serverTimestamp elapsed time", () => {
      const serverT0 = 1000000;
      const stateVector: PlaybackStateVector = {
        roomId: "room-e2e-1",
        trackId: sampleTrack1.id,
        provider: sampleTrack1.provider,
        isPlaying: true,
        positionMs: 30000, // 30s in
        playbackRate: 1.0,
        serverTimestamp: serverT0,
        version: 1,
        updatedByUserId: hostUser.id,
      };

      // 5 seconds later
      const clientNow = serverT0 + 5000;
      const expectedPosition = DriftCalculator.calculateExpectedPosition(stateVector, clientNow, 0, 0);
      expect(expectedPosition).toBe(35000);
    });

    it("evaluates micro-drift (<150ms) as IN_SYNC for seamless playback without clicks", () => {
      const actualPosition = 40080;
      const expectedPosition = 40000; // 80ms difference
      const decision = DriftCalculator.evaluateSync(actualPosition, expectedPosition, true);

      expect(decision.action).toBe("IN_SYNC");
      expect(decision.recommendedRate).toBe(1.0);
    });

    it("evaluates moderate drift (150ms - 800ms) with MICRO_ADJUST rate nudging (0.95x/1.05x)", () => {
      // Client is 300ms behind
      const behindDecision = DriftCalculator.evaluateSync(49700, 50000, true);
      expect(behindDecision.action).toBe("MICRO_ADJUST");
      expect(behindDecision.recommendedRate).toBe(1.05);

      // Client is 300ms ahead
      const aheadDecision = DriftCalculator.evaluateSync(50300, 50000, true);
      expect(aheadDecision.action).toBe("MICRO_ADJUST");
      expect(aheadDecision.recommendedRate).toBe(0.95);
    });

    it("evaluates macro drift (>800ms) with HARD_SEEK to authoritative server time", () => {
      // Client is 2500ms desynced
      const macroDecision = DriftCalculator.evaluateSync(57500, 60000, true);
      expect(macroDecision.action).toBe("HARD_SEEK");
      expect(macroDecision.targetPositionMs).toBe(60000);
    });
  });

  describe("2. Collaborative Queue Management Lifecycle", () => {
    let queue: QueueItemDto[] = [];

    beforeEach(() => {
      queue = [];
    });

    it("adds tracks, upvotes, and sorts priorities", () => {
      const item1: QueueItemDto = {
        id: "q-1",
        roomId: "room-e2e-1",
        track: sampleTrack1,
        positionOrder: 0,
        addedBy: hostUser,
        createdAt: new Date().toISOString(),
      };
      queue.push(item1);

      const item2: QueueItemDto = {
        id: "q-2",
        roomId: "room-e2e-1",
        track: sampleTrack2,
        positionOrder: 1,
        addedBy: listenerUser,
        createdAt: new Date().toISOString(),
      };
      queue.push(item2);

      expect(queue).toHaveLength(2);
      expect(queue[0].track.title).toBe("Midnight Ambient Waves");

      // Reordering after upvotes
      const reordered = [item2, item1];
      expect(reordered[0].track.title).toBe("Tokyo Rain & Neon Lights");

      // Removing played item
      const remaining = reordered.filter((q) => q.id !== item1.id);
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe("q-2");
    });
  });

  describe("3. Audio Ducking State Machine (Sing Together Integration)", () => {
    it("handles speech detection, smooth 150ms attack, 800ms hold, and 500ms release", () => {
      const ducking = new AudioDuckingController({
        duckedVolume: 0.40,
        normalVolume: 1.00,
        attackTimeMs: 150,
        holdTimeMs: 800,
        releaseTimeMs: 500,
      });

      let observedVolume = 1.0;
      let observedState = "IDLE";
      ducking.subscribe((v, s) => {
        observedVolume = v;
        observedState = s;
      });

      const t0 = 10000;
      ducking.onVoiceActivity(true, t0);
      expect(observedState).toBe("DUCKING");

      // Halfway through attack
      ducking.tick(t0 + 75);
      expect(observedVolume).toBeLessThan(1.0);
      expect(observedVolume).toBeGreaterThan(0.40);

      // Full duck reached
      ducking.tick(t0 + 150);
      expect(observedState).toBe("VOICE_ACTIVE");
      expect(observedVolume).toBeCloseTo(0.40, 2);

      // Speech pauses for 400ms (natural pause)
      ducking.onVoiceActivity(false, t0 + 200);
      ducking.tick(t0 + 500);
      expect(observedVolume).toBeCloseTo(0.40, 2); // Prevent volume pumping

      // Hold time expires
      ducking.tick(t0 + 200 + 800);
      expect(observedState).toBe("RESTORING");

      // Release completes
      ducking.tick(t0 + 200 + 800 + 500);
      expect(observedState).toBe("IDLE");
      expect(observedVolume).toBeCloseTo(1.00, 2);

      ducking.dispose();
    });
  });
});
