import { DriftCalculator } from '@sony/music-core';
import { PlaybackStateVector } from '@sony/types';

describe('PlaybackSyncEngine & DriftCalculator', () => {
  const baseState: PlaybackStateVector = {
    roomId: 'room-test-123',
    trackId: 'track-abc',
    provider: 'LICENSED_CATALOG',
    isPlaying: true,
    positionMs: 10000, // 10s
    playbackRate: 1.0,
    serverTimestamp: 1000000,
    version: 1,
    updatedByUserId: 'user-host',
    currentTrack: {
      id: 'track-abc',
      provider: 'LICENSED_CATALOG',
      providerTrackId: 'track-abc',
      title: 'Test Song',
      artist: 'Test Artist',
      album: 'Test Album',
      artworkUrl: '',
      durationMs: 180000, // 3 minutes
    },
  };

  it('correctly calculates expected position with elapsed time', () => {
    // 5 seconds elapsed on client
    const localNow = 1005000;
    const expected = DriftCalculator.calculateExpectedPosition(baseState, localNow, 0, 0);
    expect(expected).toBe(15000); // 10s + 5s = 15s
  });

  it('identifies in-sync status when drift is under tolerance (<= 150ms)', () => {
    const actualPosition = 15080;
    const expectedPosition = 15000; // 80ms drift
    const decision = DriftCalculator.evaluateSync(actualPosition, expectedPosition, true);

    expect(decision.action).toBe('IN_SYNC');
    expect(decision.recommendedRate).toBe(1.0);
  });

  it('identifies micro-drift (between 150ms and 800ms) and recommends smooth rate adjustment', () => {
    const actualPosition = 14700;
    const expectedPosition = 15000; // -300ms behind
    const decision = DriftCalculator.evaluateSync(actualPosition, expectedPosition, true);

    expect(decision.action).toBe('MICRO_ADJUST');
    expect(decision.recommendedRate).toBeGreaterThan(1.0); // 1.05x to catch up
  });

  it('triggers hard seek when drift exceeds 800ms', () => {
    const actualPosition = 12000;
    const expectedPosition = 15000; // -3000ms behind
    const decision = DriftCalculator.evaluateSync(actualPosition, expectedPosition, true);

    expect(decision.action).toBe('HARD_SEEK');
    expect(decision.targetPositionMs).toBe(15000);
  });

  it('returns IN_SYNC immediately when playback is paused', () => {
    const decision = DriftCalculator.evaluateSync(10000, 15000, false);
    expect(decision.action).toBe('IN_SYNC');
  });
});
