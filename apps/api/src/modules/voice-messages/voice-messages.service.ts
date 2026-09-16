import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../../database/prisma.service';
import { PresignUploadDto, CreateVoiceMessageDto } from './voice-messages.dto';

@Injectable()
export class VoiceMessagesService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private readonly prisma: PrismaService) {
    this.bucketName = process.env.S3_BUCKET_NAME || 'social-music-media';
    this.s3Client = new S3Client({
      region: process.env.S3_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || 'minioadmin',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'minioadmin',
      },
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    });
  }

  async generatePresignedUploadUrl(userId: string, dto: PresignUploadDto) {
    const timestamp = Date.now();
    const storageKey = `voice-notes/${userId}/${timestamp}-${Math.random().toString(36).substring(2, 8)}.m4a`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: storageKey,
      ContentType: dto.mimeType || 'audio/mp4',
    });

    try {
      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 300 }); // 5 minutes
      return {
        uploadUrl,
        storageKey,
        expiresInSec: 300,
      };
    } catch (err: any) {
      // Return a mocked URL in offline local dev mode if MinIO isn't running
      return {
        uploadUrl: `http://localhost:9000/${this.bucketName}/${storageKey}?mock=true`,
        storageKey,
        expiresInSec: 300,
      };
    }
  }

  async commitVoiceMessage(userId: string, dto: CreateVoiceMessageDto) {
    const voiceMsg = await this.prisma.voiceMessage.create({
      data: {
        senderId: userId,
        storageKey: dto.storageKey,
        durationSec: dto.durationSec,
        waveformMetadata: dto.waveformMetadata,
        fileSizeBytes: dto.fileSizeBytes,
        mimeType: dto.mimeType,
      },
    });

    if (dto.roomId) {
      await this.prisma.message.create({
        data: {
          roomId: dto.roomId,
          senderId: userId,
          content: `Voice Message (${dto.durationSec}s)`,
          type: 'VOICE',
          voiceMessageId: voiceMsg.id,
        },
      });
    }

    return voiceMsg;
  }

  async getVoiceMessage(id: string) {
    const msg = await this.prisma.voiceMessage.findUnique({
      where: { id },
      include: { sender: { include: { profile: true } } },
    });

    if (!msg) throw new NotFoundException('Voice message not found');

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: msg.storageKey,
    });

    let streamUrl: string;
    try {
      streamUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    } catch (e) {
      streamUrl = `http://localhost:9000/${this.bucketName}/${msg.storageKey}`;
    }

    return {
      ...msg,
      streamUrl,
    };
  }
}
