import { DuckingState, DuckingConfig } from '@sony/types';

export const DEFAULT_DUCKING_CONFIG: DuckingConfig = {
  duckedVolume: 0.40,  // Reduce to 40% during voice activity
  normalVolume: 1.00,  // Full 100% volume
  attackTimeMs: 150,   // Quick 150ms ease down
  holdTimeMs: 800,     // 800ms hold time to avoid volume pumping between words
  releaseTimeMs: 500,  // Smooth 500ms fade back to normal
};

export interface AudioDuckingStateListener {
  (volume: number, state: DuckingState): void;
}

/**
 * Robust Audio Ducking State Machine designed for "Sing Together" & Live Voice Rooms.
 * Decouples speech detection from abrupt volume drops using exponential attack and linear release.
 */
export class AudioDuckingController {
  private config: DuckingConfig;
  private state: DuckingState = 'IDLE';
  private currentVolume: number;
  private targetVolume: number;
  private isVoicePresent = false;
  private lastVoiceTimestamp = 0;
  private transitionStartTime = 0;
  private transitionStartVolume = 1.0;
  private activeTimer: any = null;
  private listeners: Set<AudioDuckingStateListener> = new Set();

  constructor(config: Partial<DuckingConfig> = {}) {
    this.config = { ...DEFAULT_DUCKING_CONFIG, ...config };
    this.currentVolume = this.config.normalVolume;
    this.targetVolume = this.config.normalVolume;
  }

  public subscribe(listener: AudioDuckingStateListener): () => void {
    this.listeners.add(listener);
    listener(this.currentVolume, this.state);
    return () => this.listeners.delete(listener);
  }

  public getState(): DuckingState {
    return this.state;
  }

  public getVolume(): number {
    return this.currentVolume;
  }

  /**
   * Called when voice activity detection (VAD) triggers locally or from remote participants
   */
  public onVoiceActivity(isSpeaking: boolean, nowMs = Date.now()): void {
    if (isSpeaking) {
      this.isVoicePresent = true;
      this.lastVoiceTimestamp = nowMs;

      if (this.state === 'IDLE' || this.state === 'RESTORING' || this.state === 'VOICE_ENDED') {
        this.transitionTo('DUCKING', this.config.duckedVolume, nowMs);
      }
    } else {
      this.isVoicePresent = false;
      this.lastVoiceTimestamp = nowMs;

      // If voice is active or ducking, wait for holdTimeMs before restoring to prevent pumping
      if (this.state === 'VOICE_ACTIVE' || this.state === 'DUCKING') {
        this.scheduleHoldTimeout();
      }
    }
  }

  /**
   * Periodic or frame-by-frame tick (e.g. called in requestAnimationFrame or 16ms interval)
   */
  public tick(nowMs = Date.now()): number {
    // Check if hold time expired while voice ended
    if (
      !this.isVoicePresent &&
      (this.state === 'VOICE_ACTIVE' || this.state === 'DUCKING') &&
      nowMs - this.lastVoiceTimestamp >= this.config.holdTimeMs
    ) {
      this.transitionTo('RESTORING', this.config.normalVolume, nowMs);
    }

    // Interpolate volume if transitioning
    if (this.state === 'DUCKING') {
      const elapsed = nowMs - this.transitionStartTime;
      const progress = Math.min(1.0, elapsed / Math.max(1, this.config.attackTimeMs));
      // Ease-out curve for fast yet smooth reduction
      const eased = 1 - Math.pow(1 - progress, 2);
      this.currentVolume = this.transitionStartVolume + (this.targetVolume - this.transitionStartVolume) * eased;

      if (progress >= 1.0) {
        this.currentVolume = this.config.duckedVolume;
        this.state = 'VOICE_ACTIVE';
      }
      this.notifyListeners();
    } else if (this.state === 'RESTORING') {
      const elapsed = nowMs - this.transitionStartTime;
      const progress = Math.min(1.0, elapsed / Math.max(1, this.config.releaseTimeMs));
      // Linear or smooth ease-in-out restore
      this.currentVolume = this.transitionStartVolume + (this.targetVolume - this.transitionStartVolume) * progress;

      if (progress >= 1.0) {
        this.currentVolume = this.config.normalVolume;
        this.state = 'IDLE';
      }
      this.notifyListeners();
    }

    return this.currentVolume;
  }

  private transitionTo(newState: DuckingState, targetVol: number, nowMs: number): void {
    if (this.activeTimer) {
      clearTimeout(this.activeTimer);
      this.activeTimer = null;
    }
    this.state = newState;
    this.targetVolume = targetVol;
    this.transitionStartTime = nowMs;
    this.transitionStartVolume = this.currentVolume;
    this.notifyListeners();
  }

  private scheduleHoldTimeout(): void {
    if (this.activeTimer) {
      clearTimeout(this.activeTimer);
    }
    this.activeTimer = setTimeout(() => {
      if (!this.isVoicePresent) {
        this.transitionTo('RESTORING', this.config.normalVolume, Date.now());
      }
    }, this.config.holdTimeMs);
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.currentVolume, this.state);
    }
  }

  public dispose(): void {
    if (this.activeTimer) {
      clearTimeout(this.activeTimer);
      this.activeTimer = null;
    }
    this.listeners.clear();
  }
}
