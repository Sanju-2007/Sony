import { useEffect } from 'react';
import { usePlaybackStore } from '../store/playbackStore';

/**
 * Hook to manage audio ducking during voice chat ("Sing Together").
 * Integrates directly with the playback store and updates volume smoothly.
 */
export function useAudioDucking() {
  const { volume, duckingState, isVoiceActive, setVoiceActive } = usePlaybackStore();

  useEffect(() => {
    // When local or remote voice becomes active, the playback store duckingController
    // triggers smooth attenuation from 1.0 to 0.40 over 150ms.
  }, [volume, duckingState]);

  return {
    volume,
    duckingState,
    isVoiceActive,
    setVoiceActive,
  };
}
