import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, IsInt, Min, Max } from 'class-validator';
import { RoomType } from '@sony/types';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(60)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @IsEnum(['PUBLIC', 'PRIVATE'])
  type: RoomType = 'PUBLIC';

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(100)
  maxParticipants?: number;
}

export class JoinRoomDto {
  @IsOptional()
  @IsString()
  inviteCode?: string;
}

export class UpdateRoomDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;
}
