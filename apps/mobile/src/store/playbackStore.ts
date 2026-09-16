import { create } from "zustand";
import { PlaybackStateVector, TrackMetadata, DuckingState, QueueItemDto, PublicUser } from "@sony/types";
import { AudioDuckingController } from "@sony/audio-ducking";

export interface ExtendedQueueItem extends QueueItemDto {
  upvotes: number;
  hasUpvoted?: boolean;
}

export type DuckingProfileType = "SING_TOGETHER" | "PODCAST_DJ" | "SUBTLE" | "OFF";

export const DUCKING_PROFILES: Record<DuckingProfileType, { label: string; duckedVolume: number; description: string }> = {
  SING_TOGETHER: { label: "Sing Together (40%)", duckedVolume: 0.40, description: "Optimized for singing along with vocals ducked evenly" },
  PODCAST_DJ: { label: "DJ / Voiceover (20%)", duckedVolume: 0.20, description: "Music drops to background level for clear spoken commentary" },
  SUBTLE: { label: "Subtle Bed (65%)", duckedVolume: 0.65, description: "Gentle 35% dip preserving strong bass presence" },
  OFF: { label: "Ducking Disabled", duckedVolume: 1.00, description: "Full music volume without attenuation" },
};

interface PlaybackStoreState {
  stateVector: PlaybackStateVector | null;
  currentTrack: TrackMetadata | null;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  volume: number; // 0.0 to 1.0 (ducked volume)
  duckingState: DuckingState;
  duckingProfile: DuckingProfileType;
  isVoiceActive: boolean;
  queue: ExtendedQueueItem[];

  // Phase 6: Crossfade & Ambient Soundscapes
  crossfade: {
    durationSec: 0 | 3 | 6 | 9 | 12;
    enabled: boolean;
    curve: 'EQUAL_POWER' | 'LINEAR';
    smartCue: boolean;
  };
  soundscape: {
    type: 'RAIN' | 'VINYL' | 'CAFE' | 'TAPE' | 'OFF';
    volume: number;
    isPlaying: boolean;
  };

  // Actions
  setPlaybackVector: (vector: PlaybackStateVector) => void;
  togglePlay: () => void;
  seek: (targetMs: number) => void;
  setLocalPosition: (posMs: number) => void;
  setVoiceActive: (active: boolean) => void;
  updateVolume: (vol: number, state: DuckingState) => void;
  setDuckingProfile: (profile: DuckingProfileType) => void;
  addToQueue: (track: TrackMetadata, user?: PublicUser) => void;
  removeFromQueue: (itemId: string) => void;
  upvoteQueueItem: (itemId: string) => void;
  playNext: () => void;
  playTrackImmediate: (track: TrackMetadata) => void;
  setCrossfadeDuration: (duration: 0 | 3 | 6 | 9 | 12) => void;
  toggleCrossfadeEnabled: () => void;
  toggleSmartCue: () => void;
  setSoundscapeType: (type: 'RAIN' | 'VINYL' | 'CAFE' | 'TAPE' | 'OFF') => void;
  setSoundscapeVolume: (vol: number) => void;
  toggleSoundscapePlay: () => void;
}


let duckingController = new AudioDuckingController({
  duckedVolume: DUCKING_PROFILES.SING_TOGETHER.duckedVolume,
});

const DEFAULT_QUEUE: ExtendedQueueItem[] = [
  {
    id: "queue-item-1",
    roomId: "room-late-night-1",
    positionOrder: 0,
    upvotes: 4,
    hasUpvoted: false,
    addedBy: { id: "user-2", username: "aisha", displayName: "Aisha" },
    createdAt: new Date().toISOString(),
    track: {
      id: "track-lofi-02",
      provider: "LICENSED_CATALOG",
      providerTrackId: "track-lofi-02",
      title: "Tokyo Rain & Neon Lights",
      artist: "Kaito & Maya",
      album: "Shibuya Midnight",
      artworkUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&fit=crop&q=80",
      durationMs: 195000,
      streamUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=chill-abstract-intention-12099.mp3",
    },
  },
  {
    id: "queue-item-2",
    roomId: "room-late-night-1",
    positionOrder: 1,
    upvotes: 2,
    hasUpvoted: false,
    addedBy: { id: "user-3", username: "rahul", displayName: "Rahul" },
    createdAt: new Date().toISOString(),
    track: {
      id: "track-synth-03",
      provider: "LICENSED_CATALOG",
      providerTrackId: "track-synth-03",
      title: "Solar Flare Horizon",
      artist: "Aura Electric",
      album: "Neon Genesis",
      artworkUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&fit=crop&q=80",
      durationMs: 210000,
      streamUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c7a73cbd.mp3?filename=electronic-future-beats-117997.mp3",
    },
  },
  {
    id: "queue-item-3",
    roomId: "room-late-night-1",
    positionOrder: 2,
    upvotes: 6,
    hasUpvoted: true,
    addedBy: { id: "user-preview-1", username: "sanju", displayName: "Sanju" },
    createdAt: new Date().toISOString(),
    track: {
      id: "track-acoustic-04",
      provider: "LICENSED_CATALOG",
      providerTrackId: "track-acoustic-04",
      title: "Paper Boats on the River",
      artist: "Elena Rostova",
      album: "Quiet Hours",
      artworkUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&fit=crop&q=80",
      durationMs: 180000,
      streamUrl: "https://cdn.pixabay.com/download/audio/2021/11/25/audio_9422df5f48.mp3?filename=acoustic-guitars-ambient-10657.mp3",
    },
  },
];

export const usePlaybackStore = create<PlaybackStoreState>((set, get) => {
  duckingController.subscribe((vol, state) => {
    set({ volume: vol, duckingState: state });
  });

  return {
    stateVector: {
      roomId: "room-1",
      trackId: "track-01",
      provider: "LICENSED_CATALOG",
      isPlaying: true,
      positionMs: 134000,
      playbackRate: 1.0,
      serverTimestamp: Date.now() - 134000,
      version: 42,
      updatedByUserId: "user-preview-1",
      currentTrack: {
        id: "track-01",
        provider: "LICENSED_CATALOG",
        providerTrackId: "track-01",
        title: "Blinding Lights",
        artist: "The Weeknd",
        album: "After Hours",
        artworkUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80",
        durationMs: 200000,
      },
    },
    currentTrack: {
      id: "track-01",
      provider: "LICENSED_CATALOG",
      providerTrackId: "track-01",
      title: "Blinding Lights",
      artist: "The Weeknd",
      album: "After Hours",
      artworkUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80",
      durationMs: 200000,
    },
    isPlaying: true,
    positionMs: 134000,
    durationMs: 200000,
    volume: 1.0,
    duckingState: "IDLE",
    duckingProfile: "SING_TOGETHER",
    isVoiceActive: false,
    queue: DEFAULT_QUEUE,

    // Phase 6: Crossfade & Ambient Soundscapes
    crossfade: {
      durationSec: 6,
      enabled: true,
      curve: 'EQUAL_POWER',
      smartCue: true,
    },
    soundscape: {
      type: 'RAIN',
      volume: 0.40,
      isPlaying: false,
    },

    setPlaybackVector: (vector) => {

      set({
        stateVector: vector,
        currentTrack: vector.currentTrack || null,
        isPlaying: vector.isPlaying,
        positionMs: vector.positionMs,
        durationMs: vector.currentTrack?.durationMs || 200000,
      });
    },

    togglePlay: () => {
      const current = get().isPlaying;
      set({ isPlaying: !current });
    },

    seek: (targetMs) => {
      set({ positionMs: Math.max(0, Math.min(targetMs, get().durationMs)) });
    },

    setLocalPosition: (posMs) => {
      set({ positionMs: posMs });
    },

    setVoiceActive: (active) => {
      set({ isVoiceActive: active });
      const currentProfile = get().duckingProfile;
      if (currentProfile === "OFF") {
        set({ volume: 1.0, duckingState: "IDLE" });
        return;
      }
      duckingController.onVoiceActivity(active, Date.now());
      duckingController.tick(Date.now());
    },

    updateVolume: (vol, state) => {
      set({ volume: vol, duckingState: state });
    },

    setDuckingProfile: (profile) => {
      const profileCfg = DUCKING_PROFILES[profile];
      duckingController.dispose();
      duckingController = new AudioDuckingController({
        duckedVolume: profileCfg.duckedVolume,
      });
      duckingController.subscribe((vol, state) => {
        set({ volume: vol, duckingState: state });
      });
      set({ duckingProfile: profile });
    },

    addToQueue: (track, user) => {
      const currentQueue = get().queue;
      const newItem: ExtendedQueueItem = {
        id: "queue-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        roomId: get().stateVector?.roomId || "room-1",
        track,
        positionOrder: currentQueue.length,
        upvotes: 1,
        hasUpvoted: true,
        addedBy: user || { id: "user-preview-1", username: "sanju", displayName: "Sanju" },
        createdAt: new Date().toISOString(),
      };
      set({ queue: [...currentQueue, newItem] });
    },

    removeFromQueue: (itemId) => {
      set((s) => ({ queue: s.queue.filter((q) => q.id !== itemId) }));
    },

    upvoteQueueItem: (itemId) => {
      set((s) => ({
        queue: s.queue.map((item) => {
          if (item.id === itemId) {
            const hasUpvoted = !!item.hasUpvoted;
            return {
              ...item,
              hasUpvoted: !hasUpvoted,
              upvotes: hasUpvoted ? item.upvotes - 1 : item.upvotes + 1,
            };
          }
          return item;
        }),
      }));
    },

    playNext: () => {
      const currentQueue = get().queue;
      if (currentQueue.length === 0) return;
      const [nextItem, ...remaining] = currentQueue;
      set({
        currentTrack: nextItem.track,
        positionMs: 0,
        durationMs: nextItem.track.durationMs,
        isPlaying: true,
        queue: remaining,
      });
    },

    playTrackImmediate: (track) => {
      set({
        currentTrack: track,
        positionMs: 0,
        durationMs: track.durationMs,
        isPlaying: true,
      });
    },

    setCrossfadeDuration: (duration) => {
      set((s) => ({
        crossfade: { ...s.crossfade, durationSec: duration, enabled: duration > 0 },
      }));
    },

    toggleCrossfadeEnabled: () => {
      set((s) => ({
        crossfade: { ...s.crossfade, enabled: !s.crossfade.enabled },
      }));
    },

    toggleSmartCue: () => {
      set((s) => ({
        crossfade: { ...s.crossfade, smartCue: !s.crossfade.smartCue },
      }));
    },

    setSoundscapeType: (type) => {
      set((s) => ({
        soundscape: {
          ...s.soundscape,
          type,
          isPlaying: type !== 'OFF',
        },
      }));
    },

    setSoundscapeVolume: (vol) => {
      set((s) => ({
        soundscape: { ...s.soundscape, volume: Math.max(0, Math.min(1, vol)) },
      }));
    },

    toggleSoundscapePlay: () => {
      set((s) => ({
        soundscape: { ...s.soundscape, isPlaying: !s.soundscape.isPlaying },
      }));
    },
  };
});

