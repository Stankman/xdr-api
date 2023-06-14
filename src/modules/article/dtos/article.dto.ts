import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class ArticleDTO {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    image: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    thumbnail: string;

    @ApiProperty()
    @IsBoolean()
    hidden: boolean;

    @ApiProperty()
    @IsBoolean()
    pinned: boolean;
}