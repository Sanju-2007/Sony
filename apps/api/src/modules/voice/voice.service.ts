import { Injectable, ForbiddenException } from '@nestjs/common';
import { AccessToken } from 'livekit-server-sdk';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class VoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async generateRoomToken(userId: string, roomId: string) {
    const member = await this.prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
      include: { user: { include: { profile: true } } },
    });

    if (!member) {
      throw new ForbiddenException('Must join room before accessing voice channel');
    }

    const apiKey = process.env.LIVEKIT_API_KEY || 'devkey';
    const apiSecret = process.env.LIVEKIT_API_SECRET || 'secret_dev_key_at_least_32_characters_long';
    const livekitUrl = process.env.LIVEKIT_URL || 'http://localhost:7880';

    const at = new AccessToken(apiKey, apiSecret, {
      identity: userId,
      name: member.user.profile?.displayName || member.user.username,
      ttl: '4h',
    });

    at.addGrant({
      roomJoin: true,
      room: roomId,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    return {
      token,
      serverUrl: livekitUrl,
      roomId,
      participantId: userId,
      displayName: member.user.profile?.displayName || member.user.username,
    };
  }
}
