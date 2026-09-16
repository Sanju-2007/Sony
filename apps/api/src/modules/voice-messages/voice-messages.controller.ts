import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { VoiceMessagesService } from './voice-messages.service';
import { PresignUploadDto, CreateVoiceMessageDto } from './voice-messages.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('voice-messages')
@UseGuards(JwtAuthGuard)
export class VoiceMessagesController {
  constructor(private readonly voiceMessagesService: VoiceMessagesService) {}

  @Post('presign')
  async presign(@CurrentUser('id') userId: string, @Body() dto: PresignUploadDto) {
    return this.voiceMessagesService.generatePresignedUploadUrl(userId, dto);
  }

  @Post()
  async commit(@CurrentUser('id') userId: string, @Body() dto: CreateVoiceMessageDto) {
    return this.voiceMessagesService.commitVoiceMessage(userId, dto);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.voiceMessagesService.getVoiceMessage(id);
  }
}
