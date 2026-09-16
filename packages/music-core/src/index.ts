import { TrackMetadata, MusicProviderType, PlaybackStateVector } from '@sony/types';

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
