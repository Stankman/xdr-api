import { IsNumber, IsString } from "class-validator";

export class NewPurchaseDTO {
    @IsNumber()
    avatarId: number;

    @IsNumber()
    offerId: number;

    @IsString()
    orderId: string;

    @IsString()
    payerId: string;

    @IsString()
    status: string;
}