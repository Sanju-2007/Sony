import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { PublicUser } from '@sony/types';

@Injectable()
export class SocialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getFriends(userId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: userId, status: 'ACCEPTED' },
          { addresseeId: userId, status: 'ACCEPTED' },
        ],
      },
      include: {
        requester: { include: { profile: true } },
        addressee: { include: { profile: true } },
      },
    });

    const friendList = await Promise.all(
      friendships.map(async (f) => {
        const friend = f.requesterId === userId ? f.addressee : f.requester;
        const presenceStatus = (await this.redis.get(`presence:${friend.id}`)) || 'OFFLINE';
        return {
          id: friend.id,
          username: friend.username,
          displayName: friend.profile?.displayName || friend.username,
          avatarUrl: friend.profile?.avatarUrl || null,
          bio: friend.profile?.bio || null,
          presence: presenceStatus,
          friendshipId: f.id,
        };
      }),
    );

    return friendList;
  }

  async getPendingRequests(userId: string) {
    const incoming = await this.prisma.friendship.findMany({
      where: { addresseeId: userId, status: 'PENDING' },
      include: { requester: { include: { profile: true } } },
    });

    const outgoing = await this.prisma.friendship.findMany({
      where: { requesterId: userId, status: 'PENDING' },
      include: { addressee: { include: { profile: true } } },
    });

    return {
      incoming: incoming.map((i) => ({
        id: i.id,
        user: this.toPublicUser(i.requester),
        createdAt: i.createdAt,
      })),
      outgoing: outgoing.map((o) => ({
        id: o.id,
        user: this.toPublicUser(o.addressee),
        createdAt: o.createdAt,
      })),
    };
  }

  async sendFriendRequest(requesterId: string, targetUserId: string) {
    if (requesterId === targetUserId) {
      throw new BadRequestException('Cannot send friend request to yourself');
    }

    const targetUser = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) throw new NotFoundException('Target user not found');

    const isBlocked = await this.prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: targetUserId, blockedId: requesterId },
          { blockerId: requesterId, blockedId: targetUserId },
        ],
      },
    });
    if (isBlocked) throw new BadRequestException('Action not allowed');

    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, addresseeId: targetUserId },
          { requesterId: targetUserId, addresseeId: requesterId },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'ACCEPTED') throw new ConflictException('Already friends');
      if (existing.status === 'PENDING') throw new ConflictException('Friend request already pending');
    }

    const friendship = await this.prisma.friendship.create({
      data: {
        requesterId,
        addresseeId: targetUserId,
        status: 'PENDING',
      },
    });

    return { success: true, friendshipId: friendship.id };
  }

  async acceptFriendRequest(userId: string, friendshipId: string) {
    const friendship = await this.prisma.friendship.findUnique({ where: { id: friendshipId } });
    if (!friendship || friendship.addresseeId !== userId) {
      throw new NotFoundException('Friend request not found');
    }

    await this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: 'ACCEPTED' },
    });

    return { success: true };
  }

  async removeFriend(userId: string, friendshipId: string) {
    const friendship = await this.prisma.friendship.findUnique({ where: { id: friendshipId } });
    if (!friendship || (friendship.requesterId !== userId && friendship.addresseeId !== userId)) {
      throw new NotFoundException('Friendship not found');
    }

    await this.prisma.friendship.delete({ where: { id: friendshipId } });
    return { success: true };
  }

  async blockUser(blockerId: string, targetUserId: string) {
    if (blockerId === targetUserId) throw new BadRequestException('Cannot block yourself');

    await this.prisma.$transaction(async (tx) => {
      // Remove any existing friendship
      await tx.friendship.deleteMany({
        where: {
          OR: [
            { requesterId: blockerId, addresseeId: targetUserId },
            { requesterId: targetUserId, addresseeId: blockerId },
          ],
        },
      });

      await tx.block.upsert({
        where: { blockerId_blockedId: { blockerId, blockedId: targetUserId } },
        create: { blockerId, blockedId: targetUserId },
        update: {},
      });
    });

    return { success: true };
  }

  async getDirectMessages(userId: string, targetIdOrUsername: string) {
    const targetUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: targetIdOrUsername },
          { username: targetIdOrUsername },
        ],
      },
      include: { profile: true },
    });

    if (!targetUser) return [];

    const sortedIds = [userId, targetUser.id].sort();
    const conversationId = `dm:${sortedIds[0]}:${sortedIds[1]}`;

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 100,
      include: {
        sender: { include: { profile: true } },
      },
    });

    return messages.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      senderUsername: m.sender.username,
      senderDisplayName: m.sender.profile?.displayName || m.sender.username,
      senderAvatar: m.sender.profile?.avatarUrl || null,
      content: m.content,
      type: m.type,
      createdAt: m.createdAt.toISOString(),
      isMine: m.senderId === userId,
    }));
  }

  async sendDirectMessage(
    senderId: string,
    targetIdOrUsername: string,
    content: string,
    type: 'TEXT' | 'VOICE' = 'TEXT',
  ) {
    const targetUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: targetIdOrUsername },
          { username: targetIdOrUsername },
        ],
      },
      include: { profile: true },
    });

    if (!targetUser) throw new NotFoundException('Recipient not found');

    const sortedIds = [senderId, targetUser.id].sort();
    const conversationId = `dm:${sortedIds[0]}:${sortedIds[1]}`;

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        content: content.trim(),
        type: (type as any) || 'TEXT',
      },
      include: {
        sender: { include: { profile: true } },
      },
    });

    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      senderUsername: message.sender.username,
      senderDisplayName: message.sender.profile?.displayName || message.sender.username,
      senderAvatar: message.sender.profile?.avatarUrl || null,
      recipientId: targetUser.id,
      recipientUsername: targetUser.username,
      content: message.content,
      type: message.type,
      createdAt: message.createdAt.toISOString(),
    };
  }

  private toPublicUser(user: any): PublicUser {
    return {
      id: user.id,
      username: user.username,
      displayName: user.profile?.displayName || user.username,
      avatarUrl: user.profile?.avatarUrl || null,
      bio: user.profile?.bio || null,
    };
  }
}
