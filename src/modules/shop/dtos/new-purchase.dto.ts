import { IsString } from "class-validator";

export class NewPurchaseDTO {
    //TODO AVATAR ID & OFFER ID

    @IsString()
    orderId: string;

    @IsString()
    payerId: string;

    @IsString()
    status: string;
    
    @IsString()
    delivered: string;
}