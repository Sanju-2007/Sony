import { Module } from '@nestjs/common';
import { PrismaModule } from './database/prisma.module';
import { RedisModule } from './redis/redis.module';
import { EmailModule } from './modules/email/email.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { SyncModule } from './modules/sync/sync.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { SocialModule } from './modules/social/social.module';
import { VoiceModule } from './modules/voice/voice.module';
import { VoiceMessagesModule } from './modules/voice-messages/voice-messages.module';
import { MusicModule } from './modules/music/music.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';
import { HealthModule } from './modules/health/health.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    EmailModule,
    AuthModule,
    UsersModule,
    RoomsModule,
    SyncModule,
    GatewayModule,
    SocialModule,
    VoiceModule,
    VoiceMessagesModule,
    MusicModule,
    NotificationsModule,
    ReportsModule,
    HealthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
