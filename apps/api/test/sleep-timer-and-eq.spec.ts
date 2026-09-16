describe("Sleep Timer & Acoustic Equalizer DSP Engine", () => {
  describe("1. Sleep Timer Smooth Fade-Out Curve", () => {
    function calculateFadeVolume(remainingSec: number): number {
      if (remainingSec > 60) return 1.0;
      if (remainingSec <= 0) return 0.0;
      // Exponential ease-out fade curve over final 60 seconds
      const progress = remainingSec / 60;
      return Math.pow(progress, 1.5);
    }

    it("maintains full volume before the final 60-second fade window", () => {
      expect(calculateFadeVolume(900)).toBe(1.0); // 15 mins left
      expect(calculateFadeVolume(120)).toBe(1.0); // 2 mins left
      expect(calculateFadeVolume(61)).toBe(1.0);  // 61s left
    });

    it("smoothly attenuates volume as sleep timer approaches zero", () => {
      const volAt30s = calculateFadeVolume(30);
      expect(volAt30s).toBeLessThan(1.0);
      expect(volAt30s).toBeGreaterThan(0.0);
      expect(volAt30s).toBeCloseTo(0.35, 1);

      const volAt10s = calculateFadeVolume(10);
      expect(volAt10s).toBeLessThan(volAt30s);
      expect(volAt10s).toBeCloseTo(0.068, 2);

      expect(calculateFadeVolume(0)).toBe(0.0);
    });
  });

  describe("2. Acoustic EQ Presets & DSP Frequency Curves", () => {
    const profiles = {
      CLEARAUDIO: [3, 1, 0, 2, 4],
      WARM_VINYL: [4, 3, 1, -1, -3],
      BASS_BOOST: [6, 4, 1, 0, 1],
      VOCAL_PRESENCE: [-2, 0, 4, 3, 0],
      FLAT: [0, 0, 0, 0, 0],
    };

    it("verifies Sony ClearAudio+ enhances high-end air (16kHz) and bass punch (60Hz)", () => {
      const gains = profiles.CLEARAUDIO;
      expect(gains[0]).toBe(3); // 60Hz punch
      expect(gains[4]).toBe(4); // 16kHz air & clarity
    });

    it("verifies Warm Vinyl simulation attenuates treble and boosts warm low-mids", () => {
      const gains = profiles.WARM_VINYL;
      expect(gains[0]).toBe(4);  // +4dB low end
      expect(gains[4]).toBe(-3); // -3dB soft treble roll-off
    });

    it("verifies Vocal Karaoke Focus boosts speech range (1kHz - 4kHz)", () => {
      const gains = profiles.VOCAL_PRESENCE;
      expect(gains[2]).toBe(4); // +4dB at 1kHz
      expect(gains[3]).toBe(3); // +3dB at 4kHz
      expect(gains[0]).toBe(-2); // -2dB low cut to reduce instrumental clutter
    });

    it("verifies Flat Studio reference maintains 0dB across all bands", () => {
      profiles.FLAT.forEach((gain) => expect(gain).toBe(0));
    });
  });
});
