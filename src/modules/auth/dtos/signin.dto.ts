import { IsString } from 'class-validator';

export class SignInDTO {
    @IsString()
    identification : string;
    
    @IsString()
    password : string;
}