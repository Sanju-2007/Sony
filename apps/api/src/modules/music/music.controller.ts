import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { MusicService } from './music.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MusicProviderType } from '@sony/types';

@Controller('music')
@UseGuards(JwtAuthGuard)
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Get('search')
  async search(
    @Query('q') q: string,
    @Query('provider') provider?: MusicProviderType,
  ) {
    return this.musicService.search(q, provider);
  }

  @Get(':provider/:trackId')
  async getTrack(
    @Param('provider') provider: string,
    @Param('trackId') trackId: string,
  ) {
    return this.musicService.getTrack(provider, trackId);
  }
}
