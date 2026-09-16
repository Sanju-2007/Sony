import { AudioDuckingController } from '@sony/audio-ducking';

describe('AudioDuckingController', () => {
  let controller: AudioDuckingController;

  beforeEach(() => {
    controller = new AudioDuckingController({
      duckedVolume: 0.40,
      normalVolume: 1.00,
      attackTimeMs: 100,
      holdTimeMs: 500,
      releaseTimeMs: 200,
    });
  });

  afterEach(() => {
    controller.dispose();
  });

  it('initializes in IDLE state with 1.0 normal volume', () => {
    expect(controller.getState()).toBe('IDLE');
    expect(controller.getVolume()).toBe(1.0);
  });

  it('transitions to DUCKING on voice activity and smoothly ducks volume', () => {
    const t0 = 1000;
    controller.onVoiceActivity(true, t0);
    expect(controller.getState()).toBe('DUCKING');

    // Midway through attack (50ms)
    controller.tick(t0 + 50);
    expect(controller.getVolume()).toBeLessThan(1.0);
    expect(controller.getVolume()).toBeGreaterThan(0.40);

    // End of attack (100ms)
    controller.tick(t0 + 100);
    expect(controller.getState()).toBe('VOICE_ACTIVE');
    expect(controller.getVolume()).toBeCloseTo(0.40, 2);
  });

  it('restores volume smoothly after hold time expires when voice stops', () => {
    const t0 = 1000;
    controller.onVoiceActivity(true, t0);
    controller.tick(t0 + 100); // reached 0.40 VOICE_ACTIVE

    // Voice stops
    controller.onVoiceActivity(false, t0 + 200);

    // Within hold time (< 500ms): should still be ducked to prevent pumping
    controller.tick(t0 + 400);
    expect(controller.getVolume()).toBeCloseTo(0.40, 2);

    // After hold time (t0 + 200 + 500 = t0 + 700): state transitions to RESTORING
    controller.tick(t0 + 701);
    expect(controller.getState()).toBe('RESTORING');

    // After release time (+200ms = t0 + 901): restored to IDLE 1.0
    controller.tick(t0 + 902);
    expect(controller.getState()).toBe('IDLE');
    expect(controller.getVolume()).toBeCloseTo(1.00, 2);
  });
});
