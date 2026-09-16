import { Controller, Get, Patch, Post, Param, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getMyNotifications(@CurrentUser('id') userId: string, @Query('limit') limit?: string) {
    const take = limit ? parseInt(limit, 10) : 30;
    return this.notificationsService.getUserNotifications(userId, take);
  }

  @Patch(':id/read')
  async markRead(@CurrentUser('id') userId: string, @Param('id') notificationId: string) {
    return this.notificationsService.markAsRead(userId, notificationId);
  }

  @Post('read-all')
  async markAllRead(@CurrentUser('id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }
}
