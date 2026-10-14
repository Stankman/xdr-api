import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class SettingValueDto {
  @ApiProperty({ maxLength: 10000 })
  @IsString()
  @MaxLength(10000)
  value: string;
}
