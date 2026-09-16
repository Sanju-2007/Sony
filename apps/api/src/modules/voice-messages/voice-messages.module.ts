import { Module } from '@nestjs/common';
import { VoiceMessagesService } from './voice-messages.service';
import { VoiceMessagesController } from './voice-messages.controller';

@Module({
  controllers: [VoiceMessagesController],
  providers: [VoiceMessagesService],
  exports: [VoiceMessagesService],
})
export class VoiceMessagesModule {}
