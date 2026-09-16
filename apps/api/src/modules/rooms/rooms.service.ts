import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateRoomDto, JoinRoomDto, UpdateRoomDto } from './rooms.dto';
import { RoomDetails, RoomMemberInfo, PlaybackStateVector, PublicUser } from '@sony/types';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async createRoom(ownerId: string, dto: CreateRoomDto): Promise<RoomDetails> {
    const slugBase = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const uniqueSlug = `${slugBase || 'room'}-${Math.random().toString(36).substring(2, 7)}`;
    const inviteCode = dto.type === 'PRIVATE' ? Math.random().toString(36).substring(2, 8).toUpperCase() : null;

    const room = await this.prisma.$transaction(async (tx) => {
      const newRoom = await tx.room.create({
        data: {
          name: dto.name.trim(),
          slug: uniqueSlug,
          description: dto.description?.trim(),
          type: dto.type,
          ownerId,
          coverImageUrl: dto.coverImageUrl,
          maxParticipants: dto.maxParticipants || 50,
          inviteCode,
        },
      });

      // Add owner as HOST
      await tx.roomMember.create({
        data: {
          roomId: newRoom.id,
          userId: ownerId,
          role: 'HOST',
        },
      });

      // Initialize PlaybackState
      await tx.playbackState.create({
        data: {
          roomId: newRoom.id,
          provider: 'LICENSED_CATALOG',
          trackId: 'default-ambient-track-01',
          trackTitle: 'Midnight Ambient Waves',
          artistName: 'Sony Sound Collective',
          albumName: 'Presence Vol. 1',
          durationMs: 240000,
          positionMs: 0,
          playbackRate: 1.0,
          isPlaying: false,
          serverTimestamp: BigInt(Date.now()),
          version: 1,
          updatedByUserId: ownerId,
        },
      });

      return newRoom;
    });

    return this.getRoomDetails(room.id);
  }

  async findPublicRooms(limit = 20, cursor?: string): Promise<RoomDetails[]> {
    const rooms = await this.prisma.room.findMany({
      where: {
        type: 'PUBLIC',
        status: 'ACTIVE',
      },
      include: {
        playbackState: true,
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    return rooms.map((r) => this.mapToRoomDetails(r, r._count.members, r.playbackState));
  }

  async getRoomDetails(roomId: string): Promise<RoomDetails> {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        playbackState: true,
        _count: {
          select: { members: true },
        },
      },
    });

    if (!room || room.status === 'ARCHIVED') {
      throw new NotFoundException('Room not found');
    }

    return this.mapToRoomDetails(room, room._count.members, room.playbackState);
  }

  async getRoomMembers(roomId: string): Promise<RoomMemberInfo[]> {
    const members = await this.prisma.roomMember.findMany({
      where: { roomId },
      include: {
        user: {
          include: { profile: true },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    return members.map((m) => ({
      userId: m.userId,
      roomId: m.roomId,
      role: m.role as any,
      isMuted: m.isMuted,
      isDeafened: m.isDeafened,
      joinedAt: m.joinedAt.toISOString(),
      user: {
        id: m.user.id,
        username: m.user.username,
        displayName: m.user.profile?.displayName || m.user.username,
        avatarUrl: m.user.profile?.avatarUrl || null,
        bio: m.user.profile?.bio || null,
      },
    }));
  }

  async joinRoom(roomId: string, userId: string, dto: JoinRoomDto): Promise<RoomMemberInfo> {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        _count: { select: { members: true } },
      },
    });

    if (!room || room.status === 'ARCHIVED') {
      throw new NotFoundException('Room not found');
    }

    if (room._count.members >= room.maxParticipants) {
      throw new ForbiddenException('Room is at maximum capacity');
    }

    if (room.type === 'PRIVATE' && room.ownerId !== userId) {
      if (!dto.inviteCode || dto.inviteCode.toUpperCase() !== room.inviteCode) {
        throw new ForbiddenException('Invalid room invite code');
      }
    }

    const member = await this.prisma.roomMember.upsert({
      where: {
        roomId_userId: { roomId, userId },
      },
      update: {
        lastHeartbeat: new Date(),
      },
      create: {
        roomId,
        userId,
        role: room.ownerId === userId ? 'HOST' : 'LISTENER',
      },
      include: {
        user: { include: { profile: true } },
      },
    });

    return {
      userId: member.userId,
      roomId: member.roomId,
      role: member.role as any,
      isMuted: member.isMuted,
      isDeafened: member.isDeafened,
      joinedAt: member.joinedAt.toISOString(),
      user: {
        id: member.user.id,
        username: member.user.username,
        displayName: member.user.profile?.displayName || member.user.username,
        avatarUrl: member.user.profile?.avatarUrl || null,
        bio: member.user.profile?.bio || null,
      },
    };
  }

  async leaveRoom(roomId: string, userId: string): Promise<{ newHostId?: string }> {
    const member = await this.prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });

    if (!member) return {};

    await this.prisma.roomMember.delete({
      where: { roomId_userId: { roomId, userId } },
    });

    // If leaving member was the HOST, elect next longest-standing moderator or listener
    if (member.role === 'HOST') {
      const nextLeader = await this.prisma.roomMember.findFirst({
        where: { roomId },
        orderBy: [
          { role: 'asc' }, // MODERATOR first
          { joinedAt: 'asc' }, // oldest member
        ],
      });

      if (nextLeader) {
        await this.prisma.roomMember.update({
          where: { id: nextLeader.id },
          data: { role: 'HOST' },
        });
        return { newHostId: nextLeader.userId };
      }
    }

    return {};
  }

  private mapToRoomDetails(room: any, participantCount: number, playback: any): RoomDetails {
    return {
      id: room.id,
      name: room.name,
      slug: room.slug,
      description: room.description,
      type: room.type,
      ownerId: room.ownerId,
      coverImageUrl: room.coverImageUrl,
      maxParticipants: room.maxParticipants,
      status: room.status,
      participantCount,
      currentTrack: playback ? {
        id: playback.trackId,
        provider: playback.provider as any,
        providerTrackId: playback.trackId,
        title: playback.trackTitle,
        artist: playback.artistName,
        album: playback.albumName || '',
        artworkUrl: playback.artworkUrl || '',
        durationMs: playback.durationMs,
      } : null,
      createdAt: room.createdAt.toISOString(),
      updatedAt: room.updatedAt.toISOString(),
    };
  }
}
