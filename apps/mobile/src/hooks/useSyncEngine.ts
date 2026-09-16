import { useEffect, useRef } from 'react';
import { usePlaybackStore } from '../store/playbackStore';
import { DriftCalculator, LicensedCatalogPlayerAdapter } from '@sony/music-core';
import { socketService } from '../services/socketService';

export function useSyncEngine(roomId: string) {
  const {
    stateVector,
    isPlaying,
    setLocalPosition,
  } = usePlaybackStore();

  const playerRef = useRef<LicensedCatalogPlayerAdapter | null>(null);

  useEffect(() => {
    const adapter = new LicensedCatalogPlayerAdapter();
    adapter.initialize();
    playerRef.current = adapter;

    // Periodic position updater and drift corrector (runs every 1 second)
    const interval = setInterval(async () => {
      if (!playerRef.current || !stateVector) return;

      const currentLocalPos = await playerRef.current.getCurrentPositionMs();
      setLocalPosition(currentLocalPos);

      // Evaluate drift against authoritative server vector
      const expectedPos = DriftCalculator.calculateExpectedPosition(stateVector, Date.now());
      const decision = DriftCalculator.evaluateSync(currentLocalPos, expectedPos, isPlaying);

      if (decision.action === 'MICRO_ADJUST') {
        // Nudge rate smoothly (0.95x or 1.05x)
        await playerRef.current.setPlaybackRate(decision.recommendedRate);
      } else if (decision.action === 'HARD_SEEK') {
        // Hard seek to authoritative position
        await playerRef.current.seek(decision.targetPositionMs);
        await playerRef.current.setPlaybackRate(1.0);
      } else {
        // In-sync: reset rate to 1.0x if needed
        if (playerRef.current.getPlaybackRate() !== 1.0) {
          await playerRef.current.setPlaybackRate(1.0);
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      adapter.dispose();
    };
  }, [roomId]);

  // Load track when state vector changes
  useEffect(() => {
    if (!playerRef.current || !stateVector || !stateVector.currentTrack) return;
    const expected = DriftCalculator.calculateExpectedPosition(stateVector, Date.now());
    playerRef.current.loadTrack(stateVector.currentTrack, expected, stateVector.isPlaying);
  }, [stateVector?.trackId]);

  // Handle play/pause commands from state vector
  useEffect(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.play();
    } else {
      playerRef.current.pause();
    }
  }, [isPlaying]);

  return { player: playerRef.current };
}
