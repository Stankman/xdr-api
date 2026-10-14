import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, Matches } from 'class-validator';

export class ArticleDto {
  @ApiProperty({ maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @ApiProperty({ maxLength: 50000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50000)
  content: string;

  @ApiPropertyOptional({ description: 'Path to a static frontend asset; uploads are not supported.' })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @Matches(/^\/(?!\/)(?!.*\.\.)[A-Za-z0-9/_\-.]*$/)
  image?: string;

  @ApiPropertyOptional({ description: 'Path to a static frontend asset; uploads are not supported.' })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @Matches(/^\/(?!\/)(?!.*\.\.)[A-Za-z0-9/_\-.]*$/)
  thumbnail?: string;
}
