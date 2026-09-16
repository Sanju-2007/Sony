import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SocialService } from './social.service';
import { SendFriendRequestDto } from './social.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get()
  async getFriends(@CurrentUser('id') userId: string) {
    return this.socialService.getFriends(userId);
  }

  @Get('requests')
  async getPendingRequests(@CurrentUser('id') userId: string) {
    return this.socialService.getPendingRequests(userId);
  }

  @Post('request')
  async sendFriendRequest(@CurrentUser('id') userId: string, @Body() dto: SendFriendRequestDto) {
    return this.socialService.sendFriendRequest(userId, dto.targetUserId);
  }

  @Post(':id/accept')
  async acceptFriendRequest(@CurrentUser('id') userId: string, @Param('id') friendshipId: string) {
    return this.socialService.acceptFriendRequest(userId, friendshipId);
  }

  @Delete(':id')
  async removeFriend(@CurrentUser('id') userId: string, @Param('id') friendshipId: string) {
    return this.socialService.removeFriend(userId, friendshipId);
  }

  @Post(':id/block')
  async blockUser(@CurrentUser('id') userId: string, @Param('id') targetUserId: string) {
    return this.socialService.blockUser(userId, targetUserId);
  }
}
