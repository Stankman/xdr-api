import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsNumber, IsBoolean } from "class-validator";

export class NewAccountDTO {
    @ApiProperty()    
    @IsString()
    name : string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    description : string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    prefix : string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    prefix_color : string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    badge : string;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    room_effect : number;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    log_enabled : boolean;
}