import { IsNotEmpty, IsString, IsNumber, IsArray, IsOptional, Max, Min } from 'class-validator';

export class PresignUploadDto {
  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @IsNumber()
  @Min(1)
  @Max(15 * 1024 * 1024) // 15MB max
  fileSizeBytes!: number;
}

export class CreateVoiceMessageDto {
  @IsString()
  @IsNotEmpty()
  storageKey!: string;

  @IsNumber()
  @Min(1)
  @Max(120) // 2 minutes max
  durationSec!: number;

  @IsArray()
  @IsNumber({}, { each: true })
  waveformMetadata!: number[];

  @IsNumber()
  fileSizeBytes!: number;

  @IsString()
  mimeType!: string;

  @IsOptional()
  @IsString()
  roomId?: string;

  @IsOptional()
  @IsString()
  conversationId?: string;
}
