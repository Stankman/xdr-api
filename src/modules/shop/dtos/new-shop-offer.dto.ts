import { IsDecimal, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class NewShopOfferDTO {
    @IsString()
    @ApiProperty()
    title: string;
    
    @IsString()
    @IsOptional()
    @ApiProperty()
    description: string;

    @IsString()
    @ApiProperty()
    image: string;

    @IsDecimal()
    @ApiProperty()
    price: string;

    @IsString()
    @ApiProperty()
    currency: string;

    @IsString()
    @ApiProperty()
    data: any;
}