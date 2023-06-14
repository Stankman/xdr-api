import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional } from "class-validator";

export class RoleDTO {
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
    @IsOptional()
    description : string;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    hidden: boolean;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    groupId: number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    parentId: number;
}