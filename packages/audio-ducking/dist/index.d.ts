import { DuckingState, DuckingConfig } from '@sony/types';
export declare const DEFAULT_DUCKING_CONFIG: DuckingConfig;
export interface AudioDuckingStateListener {
    (volume: number, state: DuckingState): void;
}
/**
 * Robust Audio Ducking State Machine designed for "Sing Together" & Live Voice Rooms.
 * Decouples speech detection from abrupt volume drops using exponential attack and linear release.
 */
export declare class AudioDuckingController {
    private config;
    private state;
    private currentVolume;
    private targetVolume;
    private isVoicePresent;
    private lastVoiceTimestamp;
    private transitionStartTime;
    private transitionStartVolume;
    private activeTimer;
    private listeners;
    constructor(config?: Partial<DuckingConfig>);
    subscribe(listener: AudioDuckingStateListener): () => void;
    getState(): DuckingState;
    getVolume(): number;
    /**
     * Called when voice activity detection (VAD) triggers locally or from remote participants
     */
    onVoiceActivity(isSpeaking: boolean, nowMs?: number): void;
    /**
     * Periodic or frame-by-frame tick (e.g. called in requestAnimationFrame or 16ms interval)
     */
    tick(nowMs?: number): number;
    private transitionTo;
    private scheduleHoldTimeout;
    private notifyListeners;
    dispose(): void;
}
//# sourceMappingURL=index.d.ts.map