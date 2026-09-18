import { Controller, Get, Query, Param } from '@nestjs/common';
import { MusicService } from './music.service';
import { MusicProviderType } from '@sony/types';

@Controller('music')
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Get('search')
  async search(
    @Query('q') q: string,
    @Query('provider') provider?: MusicProviderType,
  ) {
    return this.musicService.search(q, provider);
  }

  @Get('recommendations')
  async getRecommendations(
    @Query('artist') artist?: string,
    @Query('title') title?: string,
  ) {
    return this.musicService.getRecommendations(artist, title);
  }

  @Get('lyrics')
  async getLyrics(
    @Query('title') title: string,
    @Query('artist') artist?: string,
    @Query('duration') duration?: number,
  ) {
    return this.musicService.getLyrics(title, artist, duration);
  }

  @Get(':provider/:trackId')
  async getTrack(
    @Param('provider') provider: string,
    @Param('trackId') trackId: string,
  ) {
    return this.musicService.getTrack(provider, trackId);
  }
}
