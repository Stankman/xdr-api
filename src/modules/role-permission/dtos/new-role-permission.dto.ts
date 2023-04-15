import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

export class NewRolePermissionDTO {
    @ApiProperty()    
    @IsString()
    @IsNotEmpty()
    name : string;

    @ApiProperty()
    @IsString()
    description : string;
}