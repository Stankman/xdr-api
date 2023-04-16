import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsNumber } from "class-validator";

export class EditRolePermissionDTO {
    @ApiProperty()    
    @IsNumber()
    @IsNotEmpty()
    id : number;

    @ApiProperty()    
    @IsString()
    @IsNotEmpty()
    name : string;

    @ApiProperty()
    @IsString()
    description : string;
}