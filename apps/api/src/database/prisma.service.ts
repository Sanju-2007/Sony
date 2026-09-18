import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err: any) {
      console.warn(`PrismaService: Database not connected (${err.message}). Running with resilient in-memory fallback.`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
