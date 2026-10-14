import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class OneTimeTokenDto {
  @ApiProperty()
  @IsString()
  @MinLength(32)
  @MaxLength(256)
  token: string;
}
