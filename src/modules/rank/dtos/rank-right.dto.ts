import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class RankRightDTO {
    @ApiProperty()
    @IsNumber()
    group_id : number;

    @ApiProperty()
    @IsString()
    right_name : string;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    type : number;
}