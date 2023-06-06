import { Injectable } from "@nestjs/common";
import { ShopPaymentsRepository } from "../repositories/shop-payments.repository";
import { ShopPayment } from "../entities/shop-payment.entity";
import { IPaginationOptions, Pagination, IPaginationMeta } from "nestjs-typeorm-paginate";
import { FindOptionsWhere, FindManyOptions } from "typeorm";
import { NewPurchaseDTO } from "../dtos/new-purchase.dto";
import { PurchaseStatusDTO } from "../dtos/purchase-status.dto";

@Injectable()
export class ShopPaymentService {
    constructor(
        private readonly repository : ShopPaymentsRepository
    ) {}

    public async createNewPayment(newPurchaseDTO : NewPurchaseDTO) : Promise<ShopPayment> {
        const payment : ShopPayment = await this.getNewPayment(newPurchaseDTO);

        return this.repository.save(payment);
    }

    public async paginatePayments(options : IPaginationOptions, searchOptions? : FindOptionsWhere<ShopPayment> | FindManyOptions<ShopPayment>) : Promise<Pagination<ShopPayment, IPaginationMeta>> {
        return this.repository.paginate(options, searchOptions);
    }

    public async getPaymentById(id : number|string) : Promise<ShopPayment> {
        return this.repository.getPayment(id);
    }

    public async updatePaymentStatus(purchaseStatusDTO : PurchaseStatusDTO) : Promise<ShopPayment> {
        const payment : ShopPayment = await this.repository.getPayment(purchaseStatusDTO.orderId, 'order_id');
        
        payment.status = purchaseStatusDTO.status;
        payment.delivered = purchaseStatusDTO.delivered;

        return this.repository.save(payment);
    }

    private async getNewPayment(newPurchaseDTO : NewPurchaseDTO) : Promise<ShopPayment> {
        //Get Offer

        //Get Avatar
        
        const payment : ShopPayment = new ShopPayment();
        //payment.avatar = avatar;
        // payment.offer = offer;
        payment.orderId = newPurchaseDTO.orderId;
        payment.payerId = newPurchaseDTO.payerId;
        payment.status = newPurchaseDTO.status;
        return payment;
    }
}