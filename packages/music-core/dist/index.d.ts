import { TrackMetadata, MusicProviderType, PlaybackStateVector, CrossfadeGains, TasteProfile, TasteBlendResult, AmbientSoundscapeType, SessionRecapData, RoomThemeId, RoomThemeConfig, AIDJPersona, AIDJAnnouncement, ListeningMilestone, SpatialSeat } from '@sony/types';
export interface IMusicPlayerAdapter {
    readonly provider: MusicProviderType;
    initialize(): Promise<void>;
    isAuthorized(): Promise<boolean>;
    requestAuthorization(): Promise<boolean>;
    loadTrack(track: TrackMetadata, startPositionMs: number, autoPlay: boolean): Promise<void>;
    play(): Promise<void>;
    pause(): Promise<void>;
    seek(positionMs: number): Promise<void>;
    setVolume(volume: number): Promise<void>;
    setPlaybackRate(rate: number): Promise<void>;
    getCurrentPositionMs(): Promise<number>;
    getPlaybackRate(): number;
    onPlaybackEnd(callback: () => void): void;
    onError(callback: (err: Error) => void): void;
    dispose(): Promise<void>;
}
export declare abstract class MusicProvider {
    abstract readonly providerType: MusicProviderType;
    abstract search(query: string, limit?: number): Promise<TrackMetadata[]>;
    abstract getTrackById(providerTrackId: string): Promise<TrackMetadata | null>;
    abstract getRecommendations?(seedTrackId: string, limit?: number): Promise<TrackMetadata[]>;
}
export type SyncActionType = 'IN_SYNC' | 'MICRO_ADJUST' | 'HARD_SEEK';
export interface SyncDecision {
    action: SyncActionType;
    driftMs: number;
    targetPositionMs: number;
    recommendedRate: number;
}
export interface SyncEngineConfig {
    syncToleranceMs: number;
    hardSeekThresholdMs: number;
    microNudgeFactor: number;
}
export declare const DEFAULT_SYNC_CONFIG: SyncEngineConfig;
export declare class DriftCalculator {
    static calculateExpectedPosition(state: PlaybackStateVector, localNowMs: number, clockSkewMs?: number, oneWayNetworkDelayMs?: number): number;
    static evaluateSync(actualPositionMs: number, expectedPositionMs: number, isPlaying: boolean, config?: SyncEngineConfig): SyncDecision;
}
export declare class LicensedCatalogPlayerAdapter implements IMusicPlayerAdapter {
    readonly provider: MusicProviderType;
    private currentTrack;
    private isPlayingState;
    private currentPosition;
    private playbackRate;
    private volume;
    private lastUpdateTimestamp;
    private endCallbacks;
    private errorCallbacks;
    initialize(): Promise<void>;
    isAuthorized(): Promise<boolean>;
    requestAuthorization(): Promise<boolean>;
    loadTrack(track: TrackMetadata, startPositionMs: number, autoPlay: boolean): Promise<void>;
    play(): Promise<void>;
    pause(): Promise<void>;
    seek(positionMs: number): Promise<void>;
    setVolume(vol: number): Promise<void>;
    setPlaybackRate(rate: number): Promise<void>;
    getCurrentPositionMs(): Promise<number>;
    getPlaybackRate(): number;
    onPlaybackEnd(callback: () => void): void;
    onError(callback: (err: Error) => void): void;
    dispose(): Promise<void>;
}
export declare class DJCrossfadeEngine {
    /**
     * Calculates gain values for outgoing deck A and incoming deck B.
     * Equal-power crossfade (cos/sin) ensures acoustic loudness is conserved:
     * (gainA)^2 + (gainB)^2 = cos^2(t) + sin^2(t) = 1.0 (0 dB drop at midpoint)
     */
    static calculateGains(progress: number, curve?: 'EQUAL_POWER' | 'LINEAR'): CrossfadeGains;
    /**
     * Checks whether the current track is within the crossfade transition trigger window.
     */
    static isTransitionWindow(positionMs: number, durationMs: number, crossfadeDurationSec: number): boolean;
    /**
     * Calculates the current progress of transition (0.0 to 1.0) given the position and duration.
     */
    static getTransitionProgress(positionMs: number, durationMs: number, crossfadeDurationSec: number): number;
}
export declare class MusicTasteBlendEngine {
    /**
     * Computes multi-dimensional musical compatibility between two listener profiles.
     */
    static calculateCompatibility(userA: TasteProfile, userB: TasteProfile): TasteBlendResult;
    /**
     * Synthesizes a balanced collaborative 5-track queue blending both listeners' preferences.
     */
    static generateBlendQueue(userA: TasteProfile, userB: TasteProfile, catalog: TrackMetadata[]): TrackMetadata[];
}
export interface AmbientSoundscapeMetadata {
    id: AmbientSoundscapeType;
    name: string;
    subtitle: string;
    emoji: string;
    frequencyRange: string;
    description: string;
}
export declare const AMBIENT_SOUNDSCAPES: AmbientSoundscapeMetadata[];
export declare const ROOM_THEMES: Record<RoomThemeId, RoomThemeConfig>;
export declare class SessionRecapEngine {
    /**
     * Generates a Spotify Wrapped-style listening recap card for the room session.
     */
    static generateRecap(params: {
        roomId: string;
        roomName: string;
        playedTracks: TrackMetadata[];
        queueUpvotes?: Record<string, number>;
        chatMessages?: {
            userId: string;
            displayName: string;
        }[];
        voiceStats?: {
            userId: string;
            displayName: string;
            secondsSpoken: number;
        }[];
        totalReactions?: number;
        durationMinutes?: number;
    }): SessionRecapData;
}
export interface PersonaMeta {
    id: AIDJPersona;
    name: string;
    tagline: string;
    tone: string;
    avatarEmoji: string;
    samplePhrase: string;
}
export declare const AIDJ_PERSONAS: Record<AIDJPersona, PersonaMeta>;
export declare class AIDJEngine {
    /**
     * Generates natural AI DJ commentary for song transitions based on active persona.
     */
    static generateTransitionAnnouncement(options: {
        roomId: string;
        currentTrack?: TrackMetadata;
        nextTrack: TrackMetadata;
        addedBy?: string;
        persona?: AIDJPersona;
    }): AIDJAnnouncement;
    /**
     * Smart auto-queue replenishment: recommends matching tracks from a catalog pool
     * based on dominant genres and energy of recently played songs.
     */
    static recommendNextTracks(recentTracks: TrackMetadata[], catalogPool: TrackMetadata[], count?: number): TrackMetadata[];
}
export declare const DEFAULT_LISTENING_MILESTONES: ListeningMilestone[];
export declare class ListeningMilestoneTracker {
    /**
     * Evaluates current session counters and returns updated milestones with new unlocks.
     */
    static evaluateMilestones(session: {
        listeningMinutes: number;
        tracksPlayedCount: number;
        maxTrackUpvotes: number;
        currentMilestones?: ListeningMilestone[];
    }): {
        updatedMilestones: ListeningMilestone[];
        newlyUnlocked: ListeningMilestone[];
    };
}
export declare class SpatialAudioEngine {
    /**
     * Computes stereo pan (-1.0 left to 1.0 right) and distance attenuation gain (0.25 to 1.0)
     * for a participant located at (x, y) relative to the virtual center stage (0, 0).
     */
    static calculateSpatialParameters(x: number, y: number, sourceX?: number, sourceY?: number): {
        pan: number;
        distanceGain: number;
    };
    /**
     * Distributes room members in a circular seating arrangement around the central stage.
     */
    static arrangeCircleSeats(members: {
        userId: string;
        displayName: string;
        avatarUrl?: string;
    }[], radius?: number): SpatialSeat[];
}
//# sourceMappingURL=index.d.ts.map