import { RealtimeGateway } from "../src/modules/gateway/realtime.gateway";
import { ModerationActionPayload } from "@sony/types";

describe("Synchronized Lyrics & Host Moderation", () => {
  describe("1. Lyrics Time-Synchronization Algorithm", () => {
    const lines = [
      { timeMs: 0, text: "Intro" },
      { timeMs: 15000, text: "First verse begins" },
      { timeMs: 30000, text: "Second line of the song" },
      { timeMs: 60000, text: "Chorus starts here" },
    ];

    function getActiveLyricIndex(positionMs: number) {
      let active = 0;
      for (let i = 0; i < lines.length; i++) {
        if (positionMs >= lines[i].timeMs) {
          active = i;
        } else {
          break;
        }
      }
      return active;
    }

    it("identifies correct active line at various playback positions", () => {
      expect(getActiveLyricIndex(0)).toBe(0);
      expect(getActiveLyricIndex(14999)).toBe(0);
      expect(getActiveLyricIndex(15000)).toBe(1);
      expect(getActiveLyricIndex(25000)).toBe(1);
      expect(getActiveLyricIndex(30000)).toBe(2);
      expect(getActiveLyricIndex(75000)).toBe(3);
    });

    it("correctly parses LRC timestamps with millisecond accuracy", () => {
      function parseLrc(raw: string) {
        const regex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\](.*)/;
        const match = raw.match(regex);
        if (!match) return null;
        const min = parseInt(match[1], 10);
        const sec = parseInt(match[2], 10);
        let ms = 0;
        if (match[3]) {
          if (match[3].length === 1) ms = parseInt(match[3], 10) * 100;
          else if (match[3].length === 2) ms = parseInt(match[3], 10) * 10;
          else ms = parseInt(match[3], 10);
        }
        return {
          timeMs: min * 60000 + sec * 1000 + ms,
          text: match[4].trim(),
        };
      }

      const parsed1 = parseLrc("[01:13.13] Yeah");
      expect(parsed1).toEqual({ timeMs: 73130, text: "Yeah" });

      const parsed2 = parseLrc("[00:27.160] I've been tryna call");
      expect(parsed2).toEqual({ timeMs: 27160, text: "I've been tryna call" });

      const parsed3 = parseLrc("[02:05.5] Chorus begins");
      expect(parsed3).toEqual({ timeMs: 125500, text: "Chorus begins" });
    });

    it("applies user micro-calibration sync offset accurately", () => {
      // With a +500ms offset (lyrics slightly late compared to audio)
      const offsetMs = 500;
      const positionMs = 14600;
      const effectivePosMs = Math.max(0, positionMs + offsetMs); // 15100ms
      expect(getActiveLyricIndex(positionMs)).toBe(0); // Before offset, still line 0
      expect(getActiveLyricIndex(effectivePosMs)).toBe(1); // After offset, line 1 is active
    });

    it("calculates active line progress percentage for smooth karaoke highlighting", () => {
      function getLineProgress(effectivePosMs: number, currentLine: { timeMs: number }, nextLine?: { timeMs: number }) {
        if (!nextLine) return 1.0;
        const duration = Math.max(1000, nextLine.timeMs - currentLine.timeMs);
        const elapsed = effectivePosMs - currentLine.timeMs;
        return Math.min(1.0, Math.max(0.0, elapsed / duration));
      }

      // Line 1 is from 15000 to 30000 (15000ms duration)
      expect(getLineProgress(15000, lines[1], lines[2])).toBe(0);
      expect(getLineProgress(22500, lines[1], lines[2])).toBe(0.5);
      expect(getLineProgress(30000, lines[1], lines[2])).toBe(1.0);
    });
  });

  describe("2. Gateway Soundboard Event Broadcasting", () => {
    let gateway: RealtimeGateway;
    let mockServer: any;
    let mockSocket: any;

    beforeEach(() => {
      mockServer = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      };

      mockSocket = {
        data: { userId: "user-dj-1", username: "DJ_Sanju" },
      };

      gateway = new RealtimeGateway(
        {} as any,
        {} as any,
        {} as any,
        {} as any,
        {} as any,
      );
      gateway.server = mockServer;
    });

    it("broadcasts soundboard:played event with audio metadata to room", () => {
      gateway.handleSoundboard(mockSocket as any, {
        roomId: "room-rave-1",
        soundId: "airhorn",
        soundName: "Air Horn",
        emoji: "📢",
      });

      expect(mockServer.to).toHaveBeenCalledWith("room-rave-1");
      expect(mockServer.emit).toHaveBeenCalledWith(
        "soundboard:played",
        expect.objectContaining({
          roomId: "room-rave-1",
          soundId: "airhorn",
          emoji: "📢",
          triggeredByUserId: "user-dj-1",
          triggeredByName: "DJ_Sanju",
        })
      );
    });
  });
});
