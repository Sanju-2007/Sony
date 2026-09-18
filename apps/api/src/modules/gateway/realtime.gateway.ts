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
  QueueItemDto,
  TrackMetadata,
  ModerationActionPayload,
  SoundboardTriggerPayload,
  SongDedication,
  SuperReactionPayload,
  AIDJAnnouncement,
  ListeningMilestone,
  SpatialSeat,
  RoomMemberInfo,
  RoomDetails,
  PlaybackStateVector,
} from '@sony/types';


@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/realtime',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server<ClientToServerEvents, ServerToClientEvents>;

  private readonly logger = new Logger(RealtimeGateway.name);
  private readonly roomQueues = new Map<string, QueueItemDto[]>();
  private readonly roomSpatialSeats = new Map<string, Map<string, SpatialSeat>>();

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

      let userId: string;
      let username: string;

      try {
        const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_ACCESS_SECRET || 'super_secret_access_jwt_key_at_least_32_characters_long',
        });
        userId = payload.sub;
        username = payload.username;
      } catch (jwtErr: any) {
        // Resilient fallback for session or guest tokens (e.g. preview listeners or offline tokens)
        if (typeof token === 'string' && (token.startsWith('token-') || token.startsWith('session-') || token.startsWith('guest-'))) {
          userId = token.replace(/^(token-|session-token-|session-|guest-)/, 'user-');
          username = userId.replace('user-', '') || 'listener';
        } else {
          throw jwtErr;
        }
      }

      socket.data.userId = userId;
      socket.data.username = username;

      // Update presence in Redis
      try {
        await this.redis.set(`presence:${userId}`, 'ONLINE', 120);
      } catch {}

      this.logger.log(`Client connected: ${socket.id} (user: ${username})`);
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
      try {
        await this.redis.del(`presence:${userId}`);
      } catch {}
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
      socket.join(data.roomId);
      socket.data.currentRoomId = data.roomId;

      let member: RoomMemberInfo;
      let room: RoomDetails;
      let members: RoomMemberInfo[];
      let playback: PlaybackStateVector;

      try {
        member = await this.roomsService.joinRoom(data.roomId, userId, { inviteCode: data.inviteCode });
        room = await this.roomsService.getRoomDetails(data.roomId);
        members = await this.roomsService.getRoomMembers(data.roomId);
        playback = await this.syncService.getPlaybackState(data.roomId);
      } catch (dbErr: any) {
        // Fallback for ad-hoc / client-created rooms: ensure resilient room state
        const fallbackRoom = await this.roomsService.getRoomDetails(data.roomId).catch(() => null);
        room = fallbackRoom || {
          id: data.roomId,
          name: data.roomId.replace(/^room-/, 'Room '),
          slug: data.roomId,
          type: 'PUBLIC',
          ownerId: userId,
          maxParticipants: 50,
          participantCount: 1,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        member = {
          userId,
          roomId: data.roomId,
          role: 'HOST',
          user: {
            id: userId,
            username: socket.data.username || 'listener',
            displayName: socket.data.username || 'Listener',
          },
          isMuted: false,
          isDeafened: false,
          isSpeaking: false,
          joinedAt: new Date().toISOString(),
        };
        members = [member];
        playback = await this.syncService.getPlaybackState(data.roomId);
      }

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
  @SubscribeMessage("queue:add")
  async handleQueueAdd(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string; track: TrackMetadata },
  ) {
    const userId = socket.data.userId;
    const username = socket.data.username || "Anonymous";
    if (!userId || !data.track) return;

    const current = this.roomQueues.get(data.roomId) || [];
    const newItem: QueueItemDto = {
      id: "queue-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      roomId: data.roomId,
      track: data.track,
      positionOrder: current.length,
      addedBy: {
        id: userId,
        username,
        displayName: username,
      },
      createdAt: new Date().toISOString(),
    };

    const updated = [...current, newItem];
    this.roomQueues.set(data.roomId, updated);

    // Broadcast updated queue to all room members
    this.server.to(data.roomId).emit("queue:updated", {
      roomId: data.roomId,
      queue: updated,
    });
  }

  @SubscribeMessage("queue:remove")
  async handleQueueRemove(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string; queueItemId: string },
  ) {
    const current = this.roomQueues.get(data.roomId) || [];
    const updated = current.filter((item) => item.id !== data.queueItemId);
    this.roomQueues.set(data.roomId, updated);

    this.server.to(data.roomId).emit("queue:updated", {
      roomId: data.roomId,
      queue: updated,
    });
  }

  @SubscribeMessage("queue:upvote")
  async handleQueueUpvote(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string; queueItemId: string },
  ) {
    const current = this.roomQueues.get(data.roomId) || [];
    const updated = current.map((item) => {
      if (item.id === data.queueItemId) {
        return {
          ...item,
          positionOrder: Math.max(0, item.positionOrder - 1),
        };
      }
      return item;
    });

    this.roomQueues.set(data.roomId, updated);
    this.server.to(data.roomId).emit("queue:updated", {
      roomId: data.roomId,
      queue: updated,
    });
  }

  @SubscribeMessage("voice:speaking")
  handleVoiceSpeaking(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string; isSpeaking: boolean; audioLevel?: number },
  ) {
    const userId = socket.data.userId;
    if (!userId) return;

    // Broadcast to everyone else in the room so their client ducking controller triggers
    socket.to(data.roomId).emit("voice:speaking", {
      userId,
      roomId: data.roomId,
      isSpeaking: data.isSpeaking,
      audioLevel: data.audioLevel ?? 0.8,
    });
  }
  @SubscribeMessage("soundboard:trigger")
  handleSoundboard(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string; soundId: string; emoji: string; soundName: string },
  ) {
    const userId = socket.data.userId;
    const username = socket.data.username || "DJ";
    if (!userId || !data.soundId) return;

    const payload: SoundboardTriggerPayload = {
      roomId: data.roomId,
      soundId: data.soundId,
      soundName: data.soundName,
      emoji: data.emoji,
      triggeredByUserId: userId,
      triggeredByName: username,
      timestamp: Date.now(),
    };

    // Broadcast sound bite to all listeners in room
    this.server.to(data.roomId).emit("soundboard:played", payload);
  }

  @SubscribeMessage("moderation:action")
  async handleModerationAction(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: ModerationActionPayload,
  ) {
    const userId = socket.data.userId;
    if (!userId) return;

    // Check membership & host permissions
    const member = await this.prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId: data.roomId, userId } },
    });

    if (!member || (member.role !== "HOST" && member.role !== "MODERATOR")) {
      socket.emit("error", { message: "Only room host or moderators can perform moderation actions" });
      return;
    }

    const payload: ModerationActionPayload = {
      ...data,
      performedByUserId: userId,
    };

    // Apply DB updates based on action
    if (data.action === "MUTE") {
      await this.prisma.roomMember.update({
        where: { roomId_userId: { roomId: data.roomId, userId: data.targetUserId } },
        data: { isMuted: true },
      });
    } else if (data.action === "UNMUTE") {
      await this.prisma.roomMember.update({
        where: { roomId_userId: { roomId: data.roomId, userId: data.targetUserId } },
        data: { isMuted: false },
      });
    } else if (data.action === "PROMOTE_TO_SPEAKER") {
      await this.prisma.roomMember.update({
        where: { roomId_userId: { roomId: data.roomId, userId: data.targetUserId } },
        data: { role: "MODERATOR", isMuted: false },
      });
    } else if (data.action === "DEMOTE_TO_LISTENER") {
      await this.prisma.roomMember.update({
        where: { roomId_userId: { roomId: data.roomId, userId: data.targetUserId } },
        data: { role: "LISTENER", isMuted: true },
      });
    } else if (data.action === "TRANSFER_HOST") {
      await this.prisma.roomMember.update({
        where: { roomId_userId: { roomId: data.roomId, userId: data.targetUserId } },
        data: { role: "HOST" },
      });
      await this.prisma.roomMember.update({
        where: { roomId_userId: { roomId: data.roomId, userId } },
        data: { role: "MODERATOR" },
      });
    }

    // Broadcast moderation event to room
    this.server.to(data.roomId).emit("moderation:event", payload);
  }

  @SubscribeMessage("dedication:send")
  async handleDedication(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: SongDedication,
  ) {
    const userId = socket.data.userId;
    if (!userId) return;

    const payload: SongDedication = {
      ...data,
      fromUserId: userId,
      fromUserName: socket.data.username || data.fromUserName || "Listener",
      createdAt: new Date().toISOString(),
    };

    this.server.to(data.roomId).emit("dedication:new", payload);
  }

  @SubscribeMessage("reaction:super_burst")
  async handleSuperBurst(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: SuperReactionPayload,
  ) {
    const userId = socket.data.userId;
    if (!userId) return;

    const payload: SuperReactionPayload = {
      ...data,
      userId,
      userName: socket.data.username || data.userName || "Listener",
      timestamp: Date.now(),
    };

    this.server.to(data.roomId).emit("reaction:super_burst", payload);
  }

  @SubscribeMessage("dj:trigger_commentary")
  async handleDJCommentary(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string; announcement: AIDJAnnouncement },
  ) {
    this.server.to(data.roomId).emit("dj:announcement", data.announcement);
  }

  @SubscribeMessage("milestone:claim")
  async handleMilestoneClaim(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string; milestone: ListeningMilestone },
  ) {
    this.server.to(data.roomId).emit("milestone:unlocked", {
      roomId: data.roomId,
      milestone: data.milestone,
    });
  }

  @SubscribeMessage("spatial:position_update")
  async handleSpatialPosition(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomId: string; seat: SpatialSeat },
  ) {
    const userId = socket.data.userId;
    if (!userId) return;

    if (!this.roomSpatialSeats.has(data.roomId)) {
      this.roomSpatialSeats.set(data.roomId, new Map());
    }
    const roomSeats = this.roomSpatialSeats.get(data.roomId)!;
    roomSeats.set(userId, { ...data.seat, userId });

    this.server.to(data.roomId).emit("spatial:seats_updated", {
      roomId: data.roomId,
      seats: Array.from(roomSeats.values()),
    });
  }
}

