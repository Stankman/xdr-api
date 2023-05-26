import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength, Matches, IsOptional } from "class-validator";

export class NewAccountDTO {
    @ApiProperty()    
    @IsEmail()
    email : string;

    @ApiProperty()
    @IsString()
    @MinLength(6)
    @Matches(/^(?=.*[0-9-=?!@:.])(?=.*[a-zA-Z]).{6,}$/)
    password : string;

    @IsOptional()
    ip : string;
}