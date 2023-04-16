import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsNotEmpty } from "class-validator";

export class TogglePermissionDTO {
    @ApiProperty()    
    @IsNumber()
    @IsNotEmpty()
    role_id : number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    permission_id : number;
}