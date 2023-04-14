import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class SignUpDTO {
    @ApiProperty()    
    @IsEmail()
    email : string;

    @ApiProperty()
    @IsString()
    @MinLength(6)
    @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/)
    password : string;

    @IsOptional()
    ip : string;
}