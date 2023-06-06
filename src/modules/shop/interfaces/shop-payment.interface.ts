export interface IShopPayment {
    id: number;
    orderId: string;
    payerId: string;
    status: string;
    delivered: string;
    createdAt: Date;
    updatedAt: Date;
}