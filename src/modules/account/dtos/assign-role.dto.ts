import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsNotEmpty } from "class-validator";

export class AssignRoleDTO {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    account_id: number;
  
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    role_id: number;
  }