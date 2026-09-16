import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto, JoinRoomDto, UpdateRoomDto } from './rooms.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  async createRoom(@CurrentUser('id') userId: string, @Body() dto: CreateRoomDto) {
    return this.roomsService.createRoom(userId, dto);
  }

  @Get()
  async findPublicRooms(@Query('limit') limit?: string, @Query('cursor') cursor?: string) {
    const take = limit ? Math.min(parseInt(limit, 10), 50) : 20;
    return this.roomsService.findPublicRooms(take, cursor);
  }

  @Get(':id')
  async getRoomDetails(@Param('id') id: string) {
    const room = await this.roomsService.getRoomDetails(id);
    const members = await this.roomsService.getRoomMembers(id);
    return { room, members };
  }

  @Post(':id/join')
  async joinRoom(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: JoinRoomDto) {
    return this.roomsService.joinRoom(id, userId, dto);
  }

  @Post(':id/leave')
  async leaveRoom(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.roomsService.leaveRoom(id, userId);
  }
}
