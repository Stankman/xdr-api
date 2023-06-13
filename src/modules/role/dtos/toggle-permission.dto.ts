import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsNotEmpty, IsString } from "class-validator";

export class TogglePermissionDTO {
    @ApiProperty()    
    @IsNumber()
    @IsNotEmpty()
    roleId : number;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    permissionName : string;
}