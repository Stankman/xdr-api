import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class EmailTokenDto {
  @ApiProperty({ required: false, example: 'player@example.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(32)
  @MaxLength(256)
  token?: string;

  @ApiProperty({ required: false, minLength: 12, maxLength: 128 })
  @IsOptional()
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  newPassword?: string;
}
