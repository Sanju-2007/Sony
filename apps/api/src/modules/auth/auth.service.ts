import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './auth.dto';
import { AuthResponse, PublicUser } from '@sony/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly redis: RedisService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: dto.username.toLowerCase() }, { email: dto.email.toLowerCase() }],
      },
    });

    if (existing) {
      if (existing.username.toLowerCase() === dto.username.toLowerCase()) {
        throw new ConflictException('Username is already taken');
      }
      throw new ConflictException('Email is already registered');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username: dto.username.toLowerCase(),
          email: dto.email.toLowerCase(),
          passwordHash,
          profile: {
            create: {
              displayName: dto.displayName.trim(),
            },
          },
        },
        include: { profile: true },
      });
      return newUser;
    });

    const tokens = await this.generateTokens(user.id, user.username);
    return {
      user: this.toPublicUser(user),
      tokens,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const loginIdentifier = dto.login.toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: loginIdentifier }, { email: loginIdentifier }],
      },
      include: { profile: true },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is suspended or deactivated');
    }

    const tokens = await this.generateTokens(user.id, user.username);
    return {
      user: this.toPublicUser(user),
      tokens,
    };
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthResponse> {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_jwt_key_at_least_32_characters_long',
      });

      // Verify token in Redis / whitelist
      const stored = await this.redis.get(`refresh_token:${payload.sub}`);
      if (stored && stored !== dto.refreshToken) {
        throw new UnauthorizedException('Refresh token was revoked');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { profile: true },
      });

      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('User no longer active');
      }

      const tokens = await this.generateTokens(user.id, user.username);
      return {
        user: this.toPublicUser(user),
        tokens,
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.redis.del(`refresh_token:${userId}`);
  }

  private async generateTokens(userId: string, username: string) {
    const payload = { sub: userId, username };
    const accessSecret = process.env.JWT_ACCESS_SECRET || 'super_secret_access_jwt_key_at_least_32_characters_long';
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_jwt_key_at_least_32_characters_long';

    const accessToken = this.jwtService.sign(payload, {
      secret: accessSecret,
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: '7d',
    });

    // Store in Redis (7 days TTL)
    await this.redis.set(`refresh_token:${userId}`, refreshToken, 7 * 24 * 60 * 60);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  public toPublicUser(user: any): PublicUser {
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
