import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { PlaybackCommandPayload, PlaybackStateVector } from '@sony/types';

@Injectable()
export class SyncService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getPlaybackState(roomId: string): Promise<PlaybackStateVector> {
    // 1. Check fast Redis cache
    const cached = await this.redis.get(`playback:${roomId}`);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }

    // 2. Fetch from DB
    const state = await this.prisma.playbackState.findUnique({
      where: { roomId },
    });

    if (!state) {
      throw new NotFoundException('Playback state not found');
    }

    const vector: PlaybackStateVector = {
      roomId: state.roomId,
      trackId: state.trackId,
      provider: state.provider as any,
      isPlaying: state.isPlaying,
      positionMs: state.positionMs,
      playbackRate: state.playbackRate,
      serverTimestamp: Number(state.serverTimestamp),
      version: state.version,
      updatedByUserId: state.updatedByUserId,
      currentTrack: {
        id: state.trackId,
        provider: state.provider as any,
        providerTrackId: state.trackId,
        title: state.trackTitle,
        artist: state.artistName,
        album: state.albumName || '',
        artworkUrl: state.artworkUrl || '',
        durationMs: state.durationMs,
      },
    };

    await this.redis.set(`playback:${roomId}`, JSON.stringify(vector), 3600);
    return vector;
  }

  async processPlaybackCommand(userId: string, payload: PlaybackCommandPayload): Promise<PlaybackStateVector> {
    const { roomId, action, trackId, positionMs } = payload;

    // Check membership & permissions
    const member = await this.prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });

    if (!member) {
      throw new ForbiddenException('Not a member of this room');
    }

    // Only HOST or MODERATOR can control playback
    if (member.role === 'LISTENER') {
      throw new ForbiddenException('Only host or moderators can control playback');
    }

    const currentState = await this.prisma.playbackState.findUnique({
      where: { roomId },
    });

    if (!currentState) {
      throw new NotFoundException('Room playback state not initialized');
    }

    const serverNow = Date.now();
    let isPlaying = currentState.isPlaying;
    let newPositionMs = currentState.positionMs;
    let newTrackId = currentState.trackId;

    switch (action) {
      case 'PLAY':
        isPlaying = true;
        if (positionMs !== undefined) newPositionMs = positionMs;
        break;
      case 'PAUSE':
        isPlaying = false;
        if (positionMs !== undefined) newPositionMs = positionMs;
        break;
      case 'SEEK':
        if (positionMs !== undefined) newPositionMs = positionMs;
        break;
      case 'TRACK_CHANGED':
      case 'NEXT':
      case 'PREVIOUS':
        if (trackId) newTrackId = trackId;
        newPositionMs = 0;
        isPlaying = true;
        break;
    }

    const updatedVersion = currentState.version + 1;

    // Update in database
    const updated = await this.prisma.playbackState.update({
      where: { roomId },
      data: {
        isPlaying,
        positionMs: newPositionMs,
        trackId: newTrackId,
        serverTimestamp: BigInt(serverNow),
        version: updatedVersion,
        updatedByUserId: userId,
      },
    });

    const vector: PlaybackStateVector = {
      roomId: updated.roomId,
      trackId: updated.trackId,
      provider: updated.provider as any,
      isPlaying: updated.isPlaying,
      positionMs: updated.positionMs,
      playbackRate: updated.playbackRate,
      serverTimestamp: Number(updated.serverTimestamp),
      version: updated.version,
      updatedByUserId: updated.updatedByUserId,
      currentTrack: {
        id: updated.trackId,
        provider: updated.provider as any,
        providerTrackId: updated.trackId,
        title: updated.trackTitle,
        artist: updated.artistName,
        album: updated.albumName || '',
        artworkUrl: updated.artworkUrl || '',
        durationMs: updated.durationMs,
      },
    };

    // Cache updated vector in Redis
    await this.redis.set(`playback:${roomId}`, JSON.stringify(vector), 3600);

    return vector;
  }
}
