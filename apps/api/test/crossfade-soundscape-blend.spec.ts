import {
  DJCrossfadeEngine,
  MusicTasteBlendEngine,
  AMBIENT_SOUNDSCAPES,
} from "@sony/music-core";
import { TasteProfile, TrackMetadata } from "@sony/types";

describe("Phase 6: Audio Crossfade, Ambient Soundscapes & Taste Blend Engine", () => {
  describe("1. DJ Equal-Power Crossfade Transition Engine", () => {
    it("conserves total acoustic power across the entire crossfade transition", () => {
      const steps = [0.0, 0.25, 0.5, 0.75, 1.0];

      steps.forEach((progress) => {
        const gains = DJCrossfadeEngine.calculateGains(progress, "EQUAL_POWER");
        // Total acoustic power must equal ~1.0 (+/- 0.01 tolerance due to rounding)
        expect(gains.totalPower).toBeGreaterThanOrEqual(0.98);
        expect(gains.totalPower).toBeLessThanOrEqual(1.02);
      });
    });

    it("verifies midpoint gain in equal-power is ~0.707 to avoid the -6dB dip of linear fades", () => {
      const equalPowerMid = DJCrossfadeEngine.calculateGains(0.5, "EQUAL_POWER");
      const linearMid = DJCrossfadeEngine.calculateGains(0.5, "LINEAR");

      // In linear crossfade: gain is 0.5, total power is 0.5^2 + 0.5^2 = 0.50 (-3dB acoustic dip)
      expect(linearMid.deckAGain).toBe(0.5);
      expect(linearMid.deckBGain).toBe(0.5);
      expect(linearMid.totalPower).toBe(0.5);

      // In equal-power: cos(pi/4) = sin(pi/4) = 0.707, total power is 1.0 (zero perceived dip)
      expect(equalPowerMid.deckAGain).toBeCloseTo(0.707, 2);
      expect(equalPowerMid.deckBGain).toBeCloseTo(0.707, 2);
      expect(equalPowerMid.totalPower).toBeCloseTo(1.0, 2);
    });

    it("detects crossfade transition trigger window accurately", () => {
      const trackDurationMs = 180000; // 3 minutes
      const crossfadeSec = 6; // 6s window (174,000ms to 180,000ms)

      expect(DJCrossfadeEngine.isTransitionWindow(100000, trackDurationMs, crossfadeSec)).toBe(false);
      expect(DJCrossfadeEngine.isTransitionWindow(173000, trackDurationMs, crossfadeSec)).toBe(false);
      expect(DJCrossfadeEngine.isTransitionWindow(175000, trackDurationMs, crossfadeSec)).toBe(true);
      expect(DJCrossfadeEngine.isTransitionWindow(179000, trackDurationMs, crossfadeSec)).toBe(true);
      expect(DJCrossfadeEngine.isTransitionWindow(180000, trackDurationMs, crossfadeSec)).toBe(false);
    });

    it("computes normalized transition progress from 0.0 to 1.0", () => {
      const durationMs = 200000;
      const crossfadeSec = 10; // 10s window (190,000ms to 200,000ms)

      expect(DJCrossfadeEngine.getTransitionProgress(180000, durationMs, crossfadeSec)).toBe(0.0);
      expect(DJCrossfadeEngine.getTransitionProgress(195000, durationMs, crossfadeSec)).toBe(0.5);
      expect(DJCrossfadeEngine.getTransitionProgress(200000, durationMs, crossfadeSec)).toBe(1.0);
    });
  });

  describe("2. Music Taste Blend & Compatibility Engine", () => {
    const userSanju: TasteProfile = {
      userId: "u1",
      displayName: "Sanju",
      topGenres: ["Synthwave", "R&B", "Electronic", "Indie Pop"],
      topArtists: ["The Weeknd", "Daft Punk", "Kavinsky"],
      acousticTendency: 45,
      energyPreference: 85,
      tempoBpmAvg: 122,
    };

    const userAisha: TasteProfile = {
      userId: "u2",
      displayName: "Aisha",
      topGenres: ["Synthwave", "Electronic", "Cyberpunk", "R&B"],
      topArtists: ["The Weeknd", "Daft Punk", "Gunship"],
      acousticTendency: 40,
      energyPreference: 88,
      tempoBpmAvg: 124,
    };

    const userElena: TasteProfile = {
      userId: "u3",
      displayName: "Elena",
      topGenres: ["Acoustic", "Folk", "Classical", "Jazz"],
      topArtists: ["Ludovico Einaudi", "Bon Iver"],
      acousticTendency: 90,
      energyPreference: 30,
      tempoBpmAvg: 80,
    };

    it("calculates high compatibility score and shared vibe for similar taste profiles", () => {
      const blend = MusicTasteBlendEngine.calculateCompatibility(userSanju, userAisha);

      expect(blend.compatibilityScore).toBeGreaterThanOrEqual(80);
      expect(blend.verdict).toMatch(/(Cosmic Resonance|Sonic Soulmates|Electric Synergy)/);
      expect(blend.sharedGenres).toContain("Synthwave");
      expect(blend.sharedGenres).toContain("R&b");
      expect(blend.sharedArtists).toContain("the weeknd");
      expect(blend.breakdown.genreAffinity).toBeGreaterThan(60);
      expect(blend.breakdown.tempoHarmony).toBeGreaterThan(80);
    });

    it("calculates lower affinity score for divergent genre tastes while maintaining valid bounds", () => {
      const blend = MusicTasteBlendEngine.calculateCompatibility(userSanju, userElena);

      expect(blend.compatibilityScore).toBeLessThan(70);
      expect(blend.compatibilityScore).toBeGreaterThanOrEqual(35);
      expect(blend.verdict).toContain("Genre Explorers");
    });

    it("synthesizes a balanced 5-track collaborative queue without duplicate IDs", () => {
      const catalog: TrackMetadata[] = [
        {
          id: "t1",
          provider: "LICENSED_CATALOG",
          providerTrackId: "p1",
          title: "Neon Pulse",
          artist: "The Weeknd",
          album: "Starboy",
          artworkUrl: "art1",
          durationMs: 200000,
          genre: "Synthwave",
        },
        {
          id: "t2",
          provider: "LICENSED_CATALOG",
          providerTrackId: "p2",
          title: "Circuit Love",
          artist: "Daft Punk",
          album: "Discovery",
          artworkUrl: "art2",
          durationMs: 210000,
          genre: "Electronic",
        },
        {
          id: "t3",
          provider: "LICENSED_CATALOG",
          providerTrackId: "p3",
          title: "Midnight R&B",
          artist: "Kavinsky",
          album: "Nightcall",
          artworkUrl: "art3",
          durationMs: 195000,
          genre: "R&B",
        },
        {
          id: "t4",
          provider: "LICENSED_CATALOG",
          providerTrackId: "p4",
          title: "Cyber Starlight",
          artist: "Gunship",
          album: "Dark All Day",
          artworkUrl: "art4",
          durationMs: 220000,
          genre: "Cyberpunk",
        },
        {
          id: "t5",
          provider: "LICENSED_CATALOG",
          providerTrackId: "p5",
          title: "Prismatic Horizon",
          artist: "Chvrches",
          album: "Screen Violence",
          artworkUrl: "art5",
          durationMs: 205000,
          genre: "Indie Pop",
        },
      ];

      const queue = MusicTasteBlendEngine.generateBlendQueue(userSanju, userAisha, catalog);

      expect(queue.length).toBe(5);
      const uniqueIds = new Set(queue.map((t) => t.id));
      expect(uniqueIds.size).toBe(5);
    });
  });

  describe("3. Ambient Soundscapes Layer", () => {
    it("provides the 4 curated atmospheric soundscape presets", () => {
      expect(AMBIENT_SOUNDSCAPES.length).toBe(4);
      const ids = AMBIENT_SOUNDSCAPES.map((s) => s.id);
      expect(ids).toEqual(["RAIN", "VINYL", "CAFE", "TAPE"]);

      AMBIENT_SOUNDSCAPES.forEach((soundscape) => {
        expect(soundscape.name.length).toBeGreaterThan(0);
        expect(soundscape.frequencyRange.length).toBeGreaterThan(0);
        expect(soundscape.description.length).toBeGreaterThan(0);
      });
    });
  });
});
