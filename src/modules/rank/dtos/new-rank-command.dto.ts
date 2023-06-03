import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class NewRankCommandDTO {
    @ApiProperty()
    @IsNumber()
    group_id : number;

    @ApiProperty()
    @IsString()
    command_name : string;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    type : number;
}