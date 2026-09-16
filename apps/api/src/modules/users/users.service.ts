import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateProfileDto } from './users.dto';
import { PublicUser } from '@sony/types';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        _count: {
          select: {
            initiatedFriends: { where: { status: 'ACCEPTED' } },
            receivedFriends: { where: { status: 'ACCEPTED' } },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return {
      ...this.toPublicUser(user),
      friendsCount: user._count.initiatedFriends + user._count.receivedFriends,
      email: user.email,
      favoriteGenres: user.profile?.favoriteGenres || [],
      createdAt: user.createdAt,
    };
  }

  async updateMe(userId: string, dto: UpdateProfileDto) {
    const updatedProfile = await this.prisma.profile.upsert({
      where: { userId },
      update: {
        ...(dto.displayName && { displayName: dto.displayName.trim() }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
        ...(dto.isPrivate !== undefined && { isPrivate: dto.isPrivate }),
        ...(dto.favoriteGenres && { favoriteGenres: dto.favoriteGenres }),
      },
      create: {
        userId,
        displayName: dto.displayName?.trim() || 'Listener',
        bio: dto.bio,
        avatarUrl: dto.avatarUrl,
        isPrivate: dto.isPrivate || false,
        favoriteGenres: dto.favoriteGenres || [],
      },
      include: {
        user: true,
      },
    });

    return this.toPublicUser({ ...updatedProfile.user, profile: updatedProfile });
  }

  async getUserById(targetId: string, viewerId?: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: targetId },
      include: { profile: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new NotFoundException('User not found');
    }

    return this.toPublicUser(user);
  }

  private toPublicUser(user: any): PublicUser {
    return {
      id: user.id,
      username: user.username,
      displayName: user.profile?.displayName || user.username,
      avatarUrl: user.profile?.avatarUrl || null,
      bio: user.profile?.bio || null,
      isPrivate: user.profile?.isPrivate || false,
    };
  }
}
