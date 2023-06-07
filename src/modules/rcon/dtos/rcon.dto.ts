import { ApiProperty } from "@nestjs/swagger";
import { IsObject, IsOptional, IsString } from "class-validator";

export class RconDTO {
    @ApiProperty()
    @IsString()
    command: string;

    @ApiProperty()
    @IsOptional()
    @IsObject()
    params: any;
}