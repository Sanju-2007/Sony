import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private memoryCache: Map<string, string> = new Map();
  private isConnected = false;

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    const host = process.env.REDIS_HOST;
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);
    const password = process.env.REDIS_PASSWORD || undefined;

    // If running in production (e.g. Render Web Service) without an external Redis instance,
    // gracefully fall back to the built-in in-memory state store without connection errors.
    if (process.env.NODE_ENV === 'production' && !host && !redisUrl) {
      this.logger.log('No REDIS_URL or REDIS_HOST provided in production. Using high-performance in-memory cache.');
      return;
    }

    try {
      this.client = redisUrl
        ? new Redis(redisUrl, {
            lazyConnect: true,
            maxRetriesPerRequest: 1,
            retryStrategy: () => null,
          })
        : new Redis({
            host: host || 'localhost',
            port,
            password,
            lazyConnect: true,
            maxRetriesPerRequest: 1,
            retryStrategy: () => null,
          });

      // Attach error listener to avoid unhandled EventEmitter warnings
      this.client.on('error', () => {
        this.isConnected = false;
      });

      this.client
        .connect()
        .then(() => {
          this.isConnected = true;
          this.logger.log(`Connected to Redis at ${host || 'localhost'}:${port}`);
        })
        .catch((err) => {
          this.logger.warn(`Redis not available (${err.message}). Using resilient in-memory state fallback.`);
          this.isConnected = false;
        });
    } catch (e: any) {
      this.logger.warn(`Redis init error (${e.message}). Using resilient in-memory state fallback.`);
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.get(key);
      } catch (err) {
        return this.memoryCache.get(key) || null;
      }
    }
    return this.memoryCache.get(key) || null;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        if (ttlSeconds) {
          await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, value);
        }
        return;
      } catch (err) {
        // fallback
      }
    }
    this.memoryCache.set(key, value);
    if (ttlSeconds) {
      setTimeout(() => this.memoryCache.delete(key), ttlSeconds * 1000);
    }
  }

  async del(key: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
      } catch (err) {
        // fallback
      }
    }
    this.memoryCache.delete(key);
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit().catch(() => {});
    }
  }
}
