import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsNumber, IsBoolean, ValidateNested } from "class-validator";
import { RankCommandDTO } from "./rank-command.dto";
import { RankRightDTO } from "./rank-right.dto";
import { Type } from "class-transformer";

export class NewRankDTO {
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

    @ApiProperty()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => RankCommandDTO)
    commands : RankCommandDTO[];

    @ApiProperty()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => RankRightDTO)
    rights : RankRightDTO[];
}