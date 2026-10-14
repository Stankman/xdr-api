import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class IssueTicketDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 525600, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(525600)
  lifetimeMinutes?: number | null;

  @ApiProperty({ default: false })
  @IsBoolean()
  reusable: boolean;
}
