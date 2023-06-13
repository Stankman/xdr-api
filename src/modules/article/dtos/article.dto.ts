import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class ArticleDTO {
    @ApiProperty()
    @IsNumber()
    @IsOptional()
    id: number;

    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsString()
    description: string;

    @ApiProperty()
    @IsString()
    content: string;

    @ApiProperty()
    @IsString()
    image: string;

    @ApiProperty()
    @IsString()
    thumbnail: string;

    @ApiProperty()
    @IsBoolean()
    hidden: boolean;

    @ApiProperty()
    @IsBoolean()
    pinned: boolean;
}