import { IsNumber, IsString } from "class-validator";

export class NewPurchaseDTO {
    @IsNumber()
    offerId: number;

    @IsString()
    orderId: string;

    @IsString()
    payerId: string;

    @IsString()
    status: string;
}