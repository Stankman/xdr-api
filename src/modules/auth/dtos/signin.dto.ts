import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SignInDTO {
    @ApiProperty()
    @IsString()
    identification : string;
    
    @ApiProperty()
    @IsString()
    password : string;

    @ApiProperty()
    @IsOptional()
    ip : string;
}