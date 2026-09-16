import { RealtimeGateway } from "../src/modules/gateway/realtime.gateway";
import { TrackMetadata } from "@sony/types";

describe("RealtimeGateway Collaborative Queue & Voice Speaking", () => {
  let gateway: RealtimeGateway;
  let mockServer: any;
  let mockSocket: any;
  let mockOtherSocket: any;

  beforeEach(() => {
    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    mockOtherSocket = {
      emit: jest.fn(),
    };

    mockSocket = {
      data: { userId: "user-alice", username: "Alice" },
      to: jest.fn().mockReturnValue(mockOtherSocket),
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

  it("handles queue:add by broadcasting updated queue to all room members", async () => {
    const track: TrackMetadata = {
      id: "track-101",
      provider: "LICENSED_CATALOG",
      providerTrackId: "track-101",
      title: "Solar Waves",
      artist: "Synth Collective",
      album: "Neon Genesis",
      artworkUrl: "https://example.com/art.jpg",
      durationMs: 210000,
    };

    await gateway.handleQueueAdd(mockSocket as any, {
      roomId: "room-test-1",
      track,
    });

    expect(mockServer.to).toHaveBeenCalledWith("room-test-1");
    expect(mockServer.emit).toHaveBeenCalledWith(
      "queue:updated",
      expect.objectContaining({
        roomId: "room-test-1",
        queue: expect.arrayContaining([
          expect.objectContaining({
            track,
            addedBy: { id: "user-alice", username: "Alice", displayName: "Alice" },
          }),
        ]),
      })
    );
  });

  it("handles queue:remove by removing item and broadcasting", async () => {
    const track: TrackMetadata = {
      id: "track-102",
      provider: "LICENSED_CATALOG",
      providerTrackId: "track-102",
      title: "Raindrops",
      artist: "Lo-Fi Beats",
      album: "Chill",
      artworkUrl: "https://example.com/art.jpg",
      durationMs: 180000,
    };

    await gateway.handleQueueAdd(mockSocket as any, {
      roomId: "room-test-2",
      track,
    });

    const emittedQueue = mockServer.emit.mock.calls[0][1].queue;
    const itemId = emittedQueue[0].id;

    await gateway.handleQueueRemove(mockSocket as any, {
      roomId: "room-test-2",
      queueItemId: itemId,
    });

    const finalCall = mockServer.emit.mock.calls[1][1];
    expect(finalCall.queue).toHaveLength(0);
  });

  it("handles voice:speaking by broadcasting speaking state to other room participants", () => {
    gateway.handleVoiceSpeaking(mockSocket as any, {
      roomId: "room-test-3",
      isSpeaking: true,
      audioLevel: 0.9,
    });

    expect(mockSocket.to).toHaveBeenCalledWith("room-test-3");
    expect(mockOtherSocket.emit).toHaveBeenCalledWith("voice:speaking", {
      userId: "user-alice",
      roomId: "room-test-3",
      isSpeaking: true,
      audioLevel: 0.9,
    });
  });
});
