import { IsIn, IsString } from "class-validator";

export class NewUserDTO {
    @IsString()
    username : string;

    @IsString()
    email : string;

    @IsString()
    password : string;

    @IsString()
    look : string;

    @IsString()
    @IsIn(['M', 'F'])
    gender : string;
}