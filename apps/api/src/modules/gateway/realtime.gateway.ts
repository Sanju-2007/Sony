import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { SyncService } from '../sync/sync.service';
import { RoomsService } from '../rooms/rooms.service';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../redis/redis.service';
import {
  PlaybackCommandPayload,
  ClientToServerEvents,
  ServerToClientEvents,
  ReactionBurstPayload,
} from '@sony/types';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/realtime',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server<ClientToServerEvents, ServerToClientEvents>;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly syncService: SyncService,
    private readonly roomsService: RoomsService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) {
        socket.disconnect(true);
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET || 'super_secret_access_jwt_key_at_least_32_characters_long',
      });

      socket.data.userId = payload.sub;
      socket.data.username = payload.username;

      // Update presence in Redis
      await this.redis.set(`presence:${payload.sub}`, 'ONLINE', 120);

      this.logger.log(`Client connected: ${socket.id} (user: ${payload.username})`);
    } catch (err: any) {
      this.logger.warn(`Auth failed on socket handshake: ${err.message}`);
      socket.disconnect(true);
    }
  }

  async handleDisconnect(socket: Socket) {
    const userId = socket.data.userId;
    const currentRoomId = socket.data.currentRoomId;

    if (userId && currentRoomId) {
      try {
        const { newHostId } = await this.roomsService.leaveRoom(currentRoomId, userId);
        this.server.to(currentRoomId).emit('room:member_left', { userId, reason: 'Disconnected' });

        if (newHostId) {
          // Notify room of host change
          const playback = await this.syncService.getPlaybackState(currentRoomId);
          this.server.to(currentRoomId).emit('playback:sync', playback);
        }
      } catch (e) {}
    }

    if (userId) {
      await this.redis.del(`presence:${userId}`);
    }

    this.logger.log(`Client disconnected: ${socket.id}`);
  }

  @SubscribeMessage('room:join')
  async handleRoomJoin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string; inviteCode?: string },
  ) {
    const userId = socket.data.userId;
    if (!userId) return;

    try {
      const member = await this.roomsService.joinRoom(data.roomId, userId, { inviteCode: data.inviteCode });
      socket.join(data.roomId);
      socket.data.currentRoomId = data.roomId;

      const room = await this.roomsService.getRoomDetails(data.roomId);
      const members = await this.roomsService.getRoomMembers(data.roomId);
      const playback = await this.syncService.getPlaybackState(data.roomId);

      // Send initial room state to joining client
      socket.emit('room:state', { room, members, playback });

      // Notify other members
      socket.to(data.roomId).emit('room:member_joined', { member });
    } catch (err: any) {
      socket.emit('error', { message: err.message || 'Failed to join room' });
    }
  }

  @SubscribeMessage('room:leave')
  async handleRoomLeave(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const userId = socket.data.userId;
    if (!userId) return;

    try {
      await this.roomsService.leaveRoom(data.roomId, userId);
      socket.leave(data.roomId);
      socket.data.currentRoomId = undefined;

      this.server.to(data.roomId).emit('room:member_left', { userId });
    } catch (err: any) {
      socket.emit('error', { message: err.message });
    }
  }

  @SubscribeMessage('playback:command')
  async handlePlaybackCommand(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: PlaybackCommandPayload,
  ) {
    const userId = socket.data.userId;
    if (!userId) return;

    try {
      const updatedPlayback = await this.syncService.processPlaybackCommand(userId, payload);
      // Broadcast synchronized state to entire room (including host)
      this.server.to(payload.roomId).emit('playback:sync', updatedPlayback);
    } catch (err: any) {
      socket.emit('playback:error', { code: 'SYNC_REJECTED', message: err.message });
    }
  }

  @SubscribeMessage('playback:sync_request')
  async handleSyncRequest(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    try {
      const state = await this.syncService.getPlaybackState(data.roomId);
      socket.emit('playback:sync', state);
    } catch (err: any) {
      socket.emit('playback:error', { code: 'NOT_FOUND', message: err.message });
    }
  }

  @SubscribeMessage('chat:send')
  async handleChatMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string; content: string; type?: 'TEXT' | 'VOICE'; voiceMessageId?: string },
  ) {
    const userId = socket.data.userId;
    if (!userId || !data.content?.trim()) return;

    try {
      const message = await this.prisma.message.create({
        data: {
          roomId: data.roomId,
          senderId: userId,
          content: data.content.trim(),
          type: (data.type as any) || 'TEXT',
          voiceMessageId: data.voiceMessageId,
        },
        include: {
          sender: { include: { profile: true } },
          voiceMessage: true,
        },
      });

      const messageDto = {
        id: message.id,
        roomId: message.roomId,
        content: message.content,
        type: message.type as any,
        createdAt: message.createdAt.toISOString(),
        sender: {
          id: message.sender.id,
          username: message.sender.username,
          displayName: message.sender.profile?.displayName || message.sender.username,
          avatarUrl: message.sender.profile?.avatarUrl || null,
          bio: message.sender.profile?.bio || null,
        },
        voiceMessage: message.voiceMessage ? {
          id: message.voiceMessage.id,
          senderId: message.voiceMessage.senderId,
          storageKey: message.voiceMessage.storageKey,
          durationSec: message.voiceMessage.durationSec,
          waveformMetadata: message.voiceMessage.waveformMetadata as any,
          createdAt: message.voiceMessage.createdAt.toISOString(),
        } : null,
      };

      this.server.to(data.roomId).emit('chat:message', messageDto as any);
    } catch (err: any) {
      socket.emit('error', { message: err.message });
    }
  }

  @SubscribeMessage('chat:typing')
  handleChatTyping(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string; isTyping: boolean },
  ) {
    const userId = socket.data.userId;
    if (!userId) return;
    socket.to(data.roomId).emit('chat:typing', { userId, isTyping: data.isTyping });
  }

  @SubscribeMessage('reaction:send')
  async handleReaction(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string; emoji: string },
  ) {
    const userId = socket.data.userId;
    const username = socket.data.username;
    if (!userId || !data.emoji) return;

    // Rate-limiting check in Redis (5 reactions per 3 seconds)
    const rateKey = `rate:reaction:${userId}:${data.roomId}`;
    const count = await this.redis.get(rateKey);
    if (count && parseInt(count, 10) >= 8) {
      return; // Silently drop reaction spam
    }
    await this.redis.set(rateKey, `${(count ? parseInt(count, 10) : 0) + 1}`, 3);

    const payload: ReactionBurstPayload = {
      userId,
      roomId: data.roomId,
      emoji: data.emoji,
      timestamp: Date.now(),
      userDisplayName: username,
    };

    // Broadcast ephemeral burst immediately to room
    this.server.to(data.roomId).emit('reaction:burst', payload);
  }

  @SubscribeMessage('presence:heartbeat')
  async handleHeartbeat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { status: 'ONLINE' | 'AWAY'; currentRoomId?: string },
  ) {
    const userId = socket.data.userId;
    if (userId) {
      await this.redis.set(`presence:${userId}`, data.status, 60);
    }
  }
}
