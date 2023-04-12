import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class SignUpDTO {    
    @IsEmail()
    email : string;

    @IsString()
    @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/)
    password : string;

    @IsString()
    @IsIn(['M', 'F'])
    gender : string = 'M';

    @IsString()
    @IsOptional()
    look : string;
}