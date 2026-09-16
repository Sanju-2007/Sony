import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { VoiceService } from './voice.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @Post(':id/voice-token')
  async getVoiceToken(@Param('id') roomId: string, @CurrentUser('id') userId: string) {
    return this.voiceService.generateRoomToken(userId, roomId);
  }
}
