import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class PurchaseStatusDTO {
    @IsString()
    @ApiProperty()
    orderId: string;

    @IsString()
    @ApiProperty()
    status: string;
}