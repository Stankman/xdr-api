import { IsNumber, IsString } from "class-validator";

export class PurchaseStatusDTO {
    @IsNumber()
    orderId: string;

    @IsString()
    status: string;

    @IsString()
    delivered: string;
}