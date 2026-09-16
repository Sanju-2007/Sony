import {
  TrackMetadata,
  MusicProviderType,
  PlaybackStateVector,
  CrossfadeGains,
  CrossfadeSettings,
  CrossfadeDurationSec,
  TasteProfile,
  TasteBlendResult,
  AmbientSoundscapeType,
  AmbientSoundscapeState,
} from '@sony/types';

// ============================================================================
// MUSIC PROVIDER ADAPTER CONTRACT
// Runs strictly on client devices - NEVER streams commercial audio to server
// ============================================================================

export interface IMusicPlayerAdapter {
  readonly provider: MusicProviderType;

  initialize(): Promise<void>;
  isAuthorized(): Promise<boolean>;
  requestAuthorization(): Promise<boolean>;

  loadTrack(track: TrackMetadata, startPositionMs: number, autoPlay: boolean): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  seek(positionMs: number): Promise<void>;
  setVolume(volume: number): Promise<void>; // 0.0 to 1.0 (for ducking & user preference)
  setPlaybackRate(rate: number): Promise<void>; // 0.9x to 1.1x (for micro-drift adjustments)

  getCurrentPositionMs(): Promise<number>;
  getPlaybackRate(): number;

  onPlaybackEnd(callback: () => void): void;
  onError(callback: (err: Error) => void): void;
  dispose(): Promise<void>;
}

// ============================================================================
// ABSTRACT MUSIC PROVIDER (Metadata Search & Resolution)
// ============================================================================

export abstract class MusicProvider {
  abstract readonly providerType: MusicProviderType;

  abstract search(query: string, limit?: number): Promise<TrackMetadata[]>;
  abstract getTrackById(providerTrackId: string): Promise<TrackMetadata | null>;
  abstract getRecommendations?(seedTrackId: string, limit?: number): Promise<TrackMetadata[]>;
}

// ============================================================================
// PLAYBACK SYNCHRONIZATION ENGINE (DRIFT MATH & LOGIC)
// ============================================================================

export type SyncActionType = 'IN_SYNC' | 'MICRO_ADJUST' | 'HARD_SEEK';

export interface SyncDecision {
  action: SyncActionType;
  driftMs: number;
  targetPositionMs: number;
  recommendedRate: number;
}

export interface SyncEngineConfig {
  syncToleranceMs: number;       // e.g. 150ms: within this, don't touch playback
  hardSeekThresholdMs: number;   // e.g. 800ms: above this, hard seek
  microNudgeFactor: number;      // e.g. 0.05 (play at 0.95x or 1.05x to catch up smoothly)
}

export const DEFAULT_SYNC_CONFIG: SyncEngineConfig = {
  syncToleranceMs: 150,
  hardSeekThresholdMs: 800,
  microNudgeFactor: 0.05,
};

export class DriftCalculator {
  public static calculateExpectedPosition(
    state: PlaybackStateVector,
    localNowMs: number,
    clockSkewMs = 0,
    oneWayNetworkDelayMs = 0
  ): number {
    if (!state.isPlaying) {
      return Math.max(0, state.positionMs);
    }

    const estimatedServerNow = localNowMs - clockSkewMs - oneWayNetworkDelayMs;
    const elapsedSinceUpdate = Math.max(0, estimatedServerNow - state.serverTimestamp);
    const projectedPosition = state.positionMs + elapsedSinceUpdate * state.playbackRate;

    if (state.currentTrack?.durationMs) {
      return Math.min(state.currentTrack.durationMs, Math.max(0, projectedPosition));
    }

    return Math.max(0, projectedPosition);
  }

  public static evaluateSync(
    actualPositionMs: number,
    expectedPositionMs: number,
    isPlaying: boolean,
    config: SyncEngineConfig = DEFAULT_SYNC_CONFIG
  ): SyncDecision {
    if (!isPlaying) {
      return {
        action: 'IN_SYNC',
        driftMs: 0,
        targetPositionMs: expectedPositionMs,
        recommendedRate: 1.0,
      };
    }

    const driftMs = actualPositionMs - expectedPositionMs;
    const absDrift = Math.abs(driftMs);

    if (absDrift <= config.syncToleranceMs) {
      return {
        action: 'IN_SYNC',
        driftMs,
        targetPositionMs: expectedPositionMs,
        recommendedRate: 1.0,
      };
    }

    if (absDrift > config.hardSeekThresholdMs) {
      return {
        action: 'HARD_SEEK',
        driftMs,
        targetPositionMs: expectedPositionMs,
        recommendedRate: 1.0,
      };
    }

    const recommendedRate = driftMs < 0
      ? 1.0 + config.microNudgeFactor
      : 1.0 - config.microNudgeFactor;

    return {
      action: 'MICRO_ADJUST',
      driftMs,
      targetPositionMs: expectedPositionMs,
      recommendedRate,
    };
  }
}

// ============================================================================
// LICENSED / ROYALTY-FREE CLIENT PLAYER ADAPTER
// ============================================================================

export class LicensedCatalogPlayerAdapter implements IMusicPlayerAdapter {
  readonly provider: MusicProviderType = 'LICENSED_CATALOG';
  private currentTrack: TrackMetadata | null = null;
  private isPlayingState = false;
  private currentPosition = 0;
  private playbackRate = 1.0;
  private volume = 1.0;
  private lastUpdateTimestamp = 0;
  private endCallbacks: Set<() => void> = new Set();
  private errorCallbacks: Set<(err: Error) => void> = new Set();

  async initialize(): Promise<void> {
    this.lastUpdateTimestamp = Date.now();
  }

  async isAuthorized(): Promise<boolean> {
    return true; // Royalty-free catalog does not require external OAuth
  }

  async requestAuthorization(): Promise<boolean> {
    return true;
  }

  async loadTrack(track: TrackMetadata, startPositionMs: number, autoPlay: boolean): Promise<void> {
    this.currentTrack = track;
    this.currentPosition = startPositionMs;
    this.isPlayingState = autoPlay;
    this.lastUpdateTimestamp = Date.now();
  }

  async play(): Promise<void> {
    if (!this.isPlayingState) {
      this.isPlayingState = true;
      this.lastUpdateTimestamp = Date.now();
    }
  }

  async pause(): Promise<void> {
    if (this.isPlayingState) {
      this.currentPosition = await this.getCurrentPositionMs();
      this.isPlayingState = false;
      this.lastUpdateTimestamp = Date.now();
    }
  }

  async seek(positionMs: number): Promise<void> {
    this.currentPosition = Math.max(0, positionMs);
    this.lastUpdateTimestamp = Date.now();
  }

  async setVolume(vol: number): Promise<void> {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  async setPlaybackRate(rate: number): Promise<void> {
    this.currentPosition = await this.getCurrentPositionMs();
    this.playbackRate = Math.max(0.5, Math.min(2.0, rate));
    this.lastUpdateTimestamp = Date.now();
  }

  async getCurrentPositionMs(): Promise<number> {
    if (!this.isPlayingState) {
      return this.currentPosition;
    }
    const elapsed = Date.now() - this.lastUpdateTimestamp;
    const projected = this.currentPosition + elapsed * this.playbackRate;
    if (this.currentTrack?.durationMs && projected >= this.currentTrack.durationMs) {
      this.isPlayingState = false;
      this.currentPosition = this.currentTrack.durationMs;
      for (const cb of this.endCallbacks) cb();
      return this.currentTrack.durationMs;
    }
    return Math.round(projected);
  }

  getPlaybackRate(): number {
    return this.playbackRate;
  }

  onPlaybackEnd(callback: () => void): void {
    this.endCallbacks.add(callback);
  }

  onError(callback: (err: Error) => void): void {
    this.errorCallbacks.add(callback);
  }

  async dispose(): Promise<void> {
    this.isPlayingState = false;
    this.endCallbacks.clear();
    this.errorCallbacks.clear();
  }
}

// ============================================================================
// PHASE 6: DJ CROSSFADE & EQUAL-POWER TRANSITION ENGINE
// ============================================================================

export class DJCrossfadeEngine {
  /**
   * Calculates gain values for outgoing deck A and incoming deck B.
   * Equal-power crossfade (cos/sin) ensures acoustic loudness is conserved:
   * (gainA)^2 + (gainB)^2 = cos^2(t) + sin^2(t) = 1.0 (0 dB drop at midpoint)
   */
  public static calculateGains(
    progress: number,
    curve: 'EQUAL_POWER' | 'LINEAR' = 'EQUAL_POWER'
  ): CrossfadeGains {
    const clampedProgress = Math.max(0, Math.min(1, progress));

    if (curve === 'LINEAR') {
      const deckAGain = Math.round((1 - clampedProgress) * 1000) / 1000;
      const deckBGain = Math.round(clampedProgress * 1000) / 1000;
      return {
        deckAGain,
        deckBGain,
        progress: clampedProgress,
        totalPower: Math.round((Math.pow(deckAGain, 2) + Math.pow(deckBGain, 2)) * 1000) / 1000,
      };
    }

    // Equal-Power Curve: cos(p * pi/2), sin(p * pi/2)
    const angle = clampedProgress * (Math.PI / 2);
    const deckAGain = Math.round(Math.cos(angle) * 1000) / 1000;
    const deckBGain = Math.round(Math.sin(angle) * 1000) / 1000;
    const totalPower = Math.round((Math.pow(deckAGain, 2) + Math.pow(deckBGain, 2)) * 1000) / 1000;

    return {
      deckAGain,
      deckBGain,
      progress: clampedProgress,
      totalPower,
    };
  }

  /**
   * Checks whether the current track is within the crossfade transition trigger window.
   */
  public static isTransitionWindow(
    positionMs: number,
    durationMs: number,
    crossfadeDurationSec: number
  ): boolean {
    if (crossfadeDurationSec === 0 || durationMs <= 0) return false;
    const crossfadeMs = crossfadeDurationSec * 1000;
    const remainingMs = durationMs - positionMs;
    return remainingMs > 0 && remainingMs <= crossfadeMs;
  }

  /**
   * Calculates the current progress of transition (0.0 to 1.0) given the position and duration.
   */
  public static getTransitionProgress(
    positionMs: number,
    durationMs: number,
    crossfadeDurationSec: number
  ): number {
    if (crossfadeDurationSec === 0 || durationMs <= 0) return 1.0;
    const crossfadeMs = crossfadeDurationSec * 1000;
    const windowStartMs = durationMs - crossfadeMs;
    if (positionMs <= windowStartMs) return 0.0;
    if (positionMs >= durationMs) return 1.0;
    const progress = (positionMs - windowStartMs) / crossfadeMs;
    return Math.round(progress * 1000) / 1000;
  }

}

// ============================================================================
// PHASE 6: MUSIC TASTE BLEND & COMPATIBILITY ENGINE
// ============================================================================

export class MusicTasteBlendEngine {
  /**
   * Computes multi-dimensional musical compatibility between two listener profiles.
   */
  public static calculateCompatibility(
    userA: TasteProfile,
    userB: TasteProfile
  ): TasteBlendResult {
    // 1. Genre Affinity (Jaccard similarity with case-insensitivity)
    const genresA = new Set<string>(userA.topGenres.map((g: string) => g.toLowerCase().trim()));
    const genresB = new Set<string>(userB.topGenres.map((g: string) => g.toLowerCase().trim()));
    const sharedGenresList: string[] = [];

    genresA.forEach((g: string) => {
      if (genresB.has(g)) {
        sharedGenresList.push(g);
      }
    });

    const unionGenres = new Set<string>([...genresA, ...genresB]);
    const genreJaccard = unionGenres.size > 0 ? sharedGenresList.length / unionGenres.size : 0;
    // Boost score slightly if at least 2 genres match
    const genreAffinity = Math.min(100, Math.round(genreJaccard * 100 + (sharedGenresList.length >= 2 ? 15 : 0)));

    // 2. Shared Artists
    const artistsA = new Set<string>(userA.topArtists.map((a: string) => a.toLowerCase().trim()));
    const artistsB = new Set<string>(userB.topArtists.map((a: string) => a.toLowerCase().trim()));
    const sharedArtistsList: string[] = [];

    artistsA.forEach((a: string) => {
      if (artistsB.has(a)) {
        sharedArtistsList.push(a);
      }
    });

    // 3. Tempo Harmony (BPM proximity)
    const bpmDiff = Math.abs(userA.tempoBpmAvg - userB.tempoBpmAvg);
    const tempoHarmony = Math.max(0, Math.min(100, Math.round(100 - (bpmDiff / 50) * 100)));

    // 4. Energy Balance (Energy and Acoustic tendency)
    const energyDiff = Math.abs(userA.energyPreference - userB.energyPreference);
    const acousticDiff = Math.abs(userA.acousticTendency - userB.acousticTendency);
    const energyBalance = Math.max(0, Math.min(100, Math.round(100 - ((energyDiff + acousticDiff) / 200) * 100)));

    // 5. Total Weighted Compatibility Score
    const weightedScore = Math.round(
      genreAffinity * 0.45 + tempoHarmony * 0.25 + energyBalance * 0.30
    );
    const compatibilityScore = Math.min(99, Math.max(35, weightedScore));

    // Dynamic verdict based on score
    let verdict = 'Cosmic Resonance';
    if (compatibilityScore >= 90) {
      verdict = 'Cosmic Resonance 🌌';
    } else if (compatibilityScore >= 80) {
      verdict = 'Sonic Soulmates ⚡';
    } else if (compatibilityScore >= 70) {
      verdict = 'Electric Synergy 🎧';
    } else if (compatibilityScore >= 55) {
      verdict = 'Vibe Harmonizers 🎶';
    } else {
      verdict = 'Genre Explorers 🧭';
    }

    return {
      userA,
      userB,
      compatibilityScore,
      verdict,
      sharedGenres: sharedGenresList.map((g: string) => g.charAt(0).toUpperCase() + g.slice(1)),
      sharedArtists: sharedArtistsList,
      breakdown: {
        genreAffinity,
        tempoHarmony,
        energyBalance,
      },
      suggestedBlendTracks: [],
    };
  }

  /**
   * Synthesizes a balanced collaborative 5-track queue blending both listeners' preferences.
   */
  public static generateBlendQueue(
    userA: TasteProfile,
    userB: TasteProfile,
    catalog: TrackMetadata[]
  ): TrackMetadata[] {
    if (!catalog || catalog.length === 0) return [];

    const genresA = new Set<string>(userA.topGenres.map((g: string) => g.toLowerCase()));
    const genresB = new Set<string>(userB.topGenres.map((g: string) => g.toLowerCase()));

    // Categorize tracks
    const sharedTracks: TrackMetadata[] = [];
    const aTracks: TrackMetadata[] = [];
    const bTracks: TrackMetadata[] = [];
    const otherTracks: TrackMetadata[] = [];

    for (const track of catalog) {
      const g = (track.genre || '').toLowerCase();
      const matchesA = genresA.has(g);
      const matchesB = genresB.has(g);

      if (matchesA && matchesB) {
        sharedTracks.push(track);
      } else if (matchesA) {
        aTracks.push(track);
      } else if (matchesB) {
        bTracks.push(track);
      } else {
        otherTracks.push(track);
      }
    }


    const blend: TrackMetadata[] = [];
    const usedIds = new Set<string>();

    const addTrack = (t?: TrackMetadata) => {
      if (t && !usedIds.has(t.id) && blend.length < 5) {
        blend.push(t);
        usedIds.add(t.id);
      }
    };

    // Alternating blend curation: Shared -> A -> B -> Shared -> Alternating
    addTrack(sharedTracks[0]);
    addTrack(aTracks[0]);
    addTrack(bTracks[0]);
    addTrack(sharedTracks[1] || aTracks[1] || bTracks[1]);
    addTrack(bTracks[1] || aTracks[2] || otherTracks[0]);

    // Fill up to 5 tracks if catalog allows
    let fallbackIdx = 0;
    while (blend.length < Math.min(5, catalog.length) && fallbackIdx < catalog.length) {
      addTrack(catalog[fallbackIdx++]);
    }

    return blend;
  }
}

// ============================================================================
// PHASE 6: AMBIENT SOUNDSCAPE CATALOG
// ============================================================================

export interface AmbientSoundscapeMetadata {
  id: AmbientSoundscapeType;
  name: string;
  subtitle: string;
  emoji: string;
  frequencyRange: string;
  description: string;
}

export const AMBIENT_SOUNDSCAPES: AmbientSoundscapeMetadata[] = [
  {
    id: 'RAIN',
    name: 'Cozy Rain & Thunder',
    subtitle: 'Warm storm ambiance',
    emoji: '🌧️',
    frequencyRange: '100Hz – 8kHz (Pink noise & low rumble)',
    description: 'Gentle raindrops tapping on window pane with distant soft thunder.',
  },
  {
    id: 'VINYL',
    name: 'Analog Vinyl Crackle',
    subtitle: 'Vintage 33 RPM surface noise',
    emoji: '📻',
    frequencyRange: '2kHz – 12kHz (Periodic micro-clicks)',
    description: 'Warm vinyl needle hiss and subtle dust pops for lo-fi nostalgic listening.',
  },
  {
    id: 'CAFE',
    name: 'Tokyo Night Cafe',
    subtitle: 'Espresso bar & muffled chatter',
    emoji: '☕',
    frequencyRange: '300Hz – 4kHz (Band-passed murmur)',
    description: 'Distant ceramic cup clinks, espresso brewing, and comforting ambient chatter.',
  },
  {
    id: 'TAPE',
    name: 'Lo-Fi Cassette Hiss',
    subtitle: 'Analog tape wow & flutter',
    emoji: '📼',
    frequencyRange: '1kHz – 10kHz (Warm saturation floor)',
    description: 'Soothing magnetic cassette hiss with gentle analog pitch warmth.',
  },
];

