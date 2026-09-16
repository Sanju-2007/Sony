import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { AuthModule } from '../auth/auth.module';
import { RoomsModule } from '../rooms/rooms.module';
import { SyncModule } from '../sync/sync.module';

@Module({
  imports: [AuthModule, RoomsModule, SyncModule],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class GatewayModule {}
