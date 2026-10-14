import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class AuditQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 50;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  actorAccountId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  action?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  targetType?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
