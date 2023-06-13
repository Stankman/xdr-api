import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsNumber } from "class-validator";

export class PermissionDTO {
    @ApiProperty()    
    @IsString()
    @IsNotEmpty()
    name : string;

    @ApiProperty()
    @IsString()
    description : string;
}