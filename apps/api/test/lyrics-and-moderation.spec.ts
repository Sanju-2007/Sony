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
