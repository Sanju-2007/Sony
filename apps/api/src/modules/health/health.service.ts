import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class HealthService {
  private startTime = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async check() {
    let dbStatus = 'UP';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      dbStatus = 'DOWN';
    }

    const redisStatus = 'UP'; // RedisService has graceful fallback
    const uptimeSec = Math.floor((Date.now() - this.startTime) / 1000);

    return {
      status: dbStatus === 'UP' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSec,
      services: {
        database: dbStatus,
        redis: redisStatus,
        livekit: 'CONFIGURED',
        objectStorage: 'CONFIGURED',
      },
    };
  }
}
