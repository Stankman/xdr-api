import { IsDecimal, IsNumber, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ShopOfferDTO {
    @IsNumber()
    @IsOptional()
    @ApiProperty()
    id: number;
    
    @IsString()
    @ApiProperty()
    title: string;
    
    @IsString()
    @IsOptional()
    @ApiProperty()
    description: string;

    @IsString()
    @IsOptional()
    @ApiProperty()
    image: string;

    @IsDecimal()
    @IsOptional()
    @ApiProperty()
    price: number;

    @IsOptional()
    @ApiProperty()
    data: any;

}