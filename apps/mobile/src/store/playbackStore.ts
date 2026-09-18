import { create } from "zustand";
import { PlaybackStateVector, TrackMetadata, DuckingState, QueueItemDto, PublicUser } from "@sony/types";
import { AudioDuckingController } from "@sony/audio-ducking";
import { webAudioService } from "../services/webAudioService";

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
  addTracksToQueue: (tracks: TrackMetadata[], user?: PublicUser) => void;
  removeFromQueue: (itemId: string) => void;
  upvoteQueueItem: (itemId: string) => void;
  playNext: () => void;
  playQueueItem: (itemId: string) => void;
  clearQueue: () => void;
  moveQueueItem: (itemId: string, direction: 'up' | 'down') => void;
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

export const usePlaybackStore = create<PlaybackStoreState>((set, get) => {
  duckingController.subscribe((vol, state) => {
    set({ volume: vol, duckingState: state });
    webAudioService.setVolume(vol);
  });

  let lastRealAudioUpdate = 0;

  webAudioService.subscribe(
    (posMs) => {
      lastRealAudioUpdate = Date.now();
      set({ positionMs: posMs });
    },
    () => {
      get().playNext();
    }
  );

  // Background ticker so scrub bar & visualizer stay animated when running in simulated mode without live audio
  if (typeof setInterval !== "undefined") {
    setInterval(() => {
      const state = get();
      const isLiveAudioActive = Date.now() - lastRealAudioUpdate < 1500 || webAudioService.isActuallyPlaying();
      if (!isLiveAudioActive && state.isPlaying && state.durationMs > 0) {
        const nextPos = state.positionMs + 1000;
        if (nextPos >= state.durationMs) {
          state.playNext();
        } else {
          set({ positionMs: nextPos });
        }
      }
    }, 1000);
  }

  return {
    stateVector: null,
    currentTrack: null,
    isPlaying: false,
    positionMs: 0,
    durationMs: 0,
    volume: 1.0,
    duckingState: "IDLE",
    duckingProfile: "SING_TOGETHER",
    isVoiceActive: false,
    queue: [],

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
      if (vector.isPlaying && vector.currentTrack) {
        webAudioService.playTrack(vector.currentTrack, vector.positionMs);
      } else if (!vector.isPlaying) {
        webAudioService.pause();
      }
    },

    togglePlay: () => {
      const current = get().isPlaying;
      if (current) {
        webAudioService.pause();
      } else {
        const track = get().currentTrack;
        if (track) {
          webAudioService.playTrack(track, get().positionMs);
        } else {
          webAudioService.resume();
        }
      }
      set({ isPlaying: !current });
    },

    seek: (targetMs) => {
      const clamped = Math.max(0, Math.min(targetMs, get().durationMs));
      webAudioService.seek(clamped);
      set({ positionMs: clamped });
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

    addTracksToQueue: (tracks, user) => {
      const currentQueue = get().queue;
      const newItems: ExtendedQueueItem[] = tracks.map((track, i) => ({
        id: "queue-" + Date.now() + "-" + i + "-" + Math.random().toString(36).substring(2, 6),
        roomId: get().stateVector?.roomId || "room-1",
        track,
        positionOrder: currentQueue.length + i,
        upvotes: 1,
        hasUpvoted: true,
        addedBy: user || { id: "user-preview-1", username: "sanju", displayName: "Sanju" },
        createdAt: new Date().toISOString(),
      }));
      set({ queue: [...currentQueue, ...newItems] });
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
      webAudioService.playTrack(nextItem.track, 0);
      set({
        currentTrack: nextItem.track,
        positionMs: 0,
        durationMs: nextItem.track.durationMs,
        isPlaying: true,
        queue: remaining,
      });
    },

    playQueueItem: (itemId) => {
      const currentQueue = get().queue;
      const targetIndex = currentQueue.findIndex((q) => q.id === itemId);
      if (targetIndex === -1) return;
      const targetItem = currentQueue[targetIndex];
      const remaining = currentQueue.filter((_, idx) => idx !== targetIndex);
      webAudioService.playTrack(targetItem.track, 0);
      set({
        currentTrack: targetItem.track,
        positionMs: 0,
        durationMs: targetItem.track.durationMs || 200000,
        isPlaying: true,
        queue: remaining,
      });
    },

    clearQueue: () => {
      set({ queue: [] });
    },

    moveQueueItem: (itemId, direction) => {
      const currentQueue = [...get().queue];
      const index = currentQueue.findIndex((q) => q.id === itemId);
      if (index === -1) return;
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= currentQueue.length) return;
      const [item] = currentQueue.splice(index, 1);
      currentQueue.splice(targetIndex, 0, item);
      set({ queue: currentQueue });
    },

    playTrackImmediate: (track) => {
      webAudioService.playTrack(track, 0);
      set({
        currentTrack: track,
        positionMs: 0,
        durationMs: track.durationMs || 200000,
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

