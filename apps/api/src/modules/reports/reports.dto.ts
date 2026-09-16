import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';

export class CreateReportDto {
  @IsString()
  @IsIn(['USER', 'ROOM', 'MESSAGE'])
  targetType!: string;

  @IsString()
  @IsNotEmpty()
  targetId!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;

  @IsOptional()
  @IsString()
  details?: string;
}
