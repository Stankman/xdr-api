import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

const SANCTION_ACTIONS = [
  'ban',
  'unban',
  'silence',
  'unsilence',
  'tradelock',
  'untradelock',
  'warn',
] as const;

export class PlayerActionDto {
  @ApiProperty({ enum: SANCTION_ACTIONS })
  @IsIn(SANCTION_ACTIONS)
  action: (typeof SANCTION_ACTIONS)[number];

  @ApiPropertyOptional({ example: '7d' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  duration?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
