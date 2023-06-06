import { ModelEntitySerializer } from "src/common/serializers/model.serializer";
import { IShopPayment } from "../interfaces/shop-payment.interface";

export class ShopPaymentSerializer extends ModelEntitySerializer implements IShopPayment {
    id: number;
    orderId: string;
    payerId: string;
    status: string;
    delivered: string;
    createdAt: Date;
    updatedAt: Date;
}