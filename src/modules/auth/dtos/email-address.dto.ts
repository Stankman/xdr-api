import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength } from 'class-validator';

export class EmailAddressDto {
  @ApiProperty({ example: 'player@example.com' })
  @IsEmail()
  @MaxLength(254)
  email: string;
}
