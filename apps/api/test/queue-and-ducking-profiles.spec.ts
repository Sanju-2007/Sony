import { AudioDuckingController, DEFAULT_DUCKING_CONFIG } from "@sony/audio-ducking";

describe("Ducking Profiles & Dynamic Attenuation", () => {
  it("initializes with customized ducking profile volume (e.g. 20% for DJ / Voiceover)", () => {
    const djController = new AudioDuckingController({
      duckedVolume: 0.20,
    });

    expect(djController.getVolume()).toBe(1.0);
    expect(djController.getState()).toBe("IDLE");

    const t0 = 1000;
    djController.onVoiceActivity(true, t0);
    expect(djController.getState()).toBe("DUCKING");

    // Fast-forward attack time
    djController.tick(t0 + 150);
    expect(djController.getState()).toBe("VOICE_ACTIVE");
    expect(djController.getVolume()).toBeCloseTo(0.20, 2);

    djController.dispose();
  });

  it("subtle ducking profile (65% volume) preserves 65% musical energy", () => {
    const subtleController = new AudioDuckingController({
      duckedVolume: 0.65,
    });

    const t0 = 2000;
    subtleController.onVoiceActivity(true, t0);
    subtleController.tick(t0 + 150);

    expect(subtleController.getVolume()).toBeCloseTo(0.65, 2);
    subtleController.dispose();
  });

  it("prevents volume pumping during short voice pauses with holdTimeMs", () => {
    const controller = new AudioDuckingController({
      duckedVolume: 0.40,
      holdTimeMs: 800,
    });

    const t0 = 1000;
    controller.onVoiceActivity(true, t0);
    controller.tick(t0 + 150);
    expect(controller.getState()).toBe("VOICE_ACTIVE");

    // Voice briefly stops (pause between words) for 300ms
    controller.onVoiceActivity(false, t0 + 200);
    controller.tick(t0 + 500);

    // Still remains ducked because 300ms < 800ms hold time
    expect(controller.getVolume()).toBeCloseTo(0.40, 2);

    // Voice resumes
    controller.onVoiceActivity(true, t0 + 600);
    controller.tick(t0 + 700);
    expect(controller.getState()).toBe("VOICE_ACTIVE");

    controller.dispose();
  });
});
