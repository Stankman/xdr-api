import { Injectable } from "@nestjs/common";
import { ShopPaymentsRepository } from "../repositories/shop-payments.repository";
import { ShopPayment } from "../entities/shop-payment.entity";
import { IPaginationOptions, Pagination, IPaginationMeta } from "nestjs-typeorm-paginate";
import { FindOptionsWhere, FindManyOptions } from "typeorm";
import { NewPurchaseDTO } from "../dtos/new-purchase.dto";
import { PurchaseStatusDTO } from "../dtos/purchase-status.dto";
import { RconService } from "src/modules/rcon/services/rcon.service";
import { ShopOfferService } from "./shop-offer.service";
import { AvatarService } from "src/modules/avatar/services/avatar.service";
import { ShopOffer } from "../entities/shop-offer.entity";
import { Avatar } from "src/modules/avatar/entities/avatar.entity";
import { DuplicatePaymentException } from "../exceptions/duplicate-payment.exception";

@Injectable()
export class ShopPaymentService {
    private readonly COMPLETED : string = "COMPLETED";
    private readonly CANCELLED : string = "CANCELLED";
    private readonly DELIVERED_YES : string = "YES";

    constructor(
        private readonly repository : ShopPaymentsRepository,
        private readonly rconService : RconService,
        private readonly shopOfferService : ShopOfferService,
        private readonly avatarService : AvatarService
    ) {}

    public async createNewPayment(newPurchaseDTO : NewPurchaseDTO, loggedAvatar : Avatar) : Promise<ShopPayment> {
        const existingOrder : ShopPayment = await this.repository.getPayment(newPurchaseDTO.orderId, 'orderId', [], false);

        if(existingOrder) {
            throw new DuplicatePaymentException();
        }

        const payment : ShopPayment = await this.getNewPayment(newPurchaseDTO, loggedAvatar);
        return this.repository.save(payment);
    }

    public async paginatePayments(options : IPaginationOptions, searchOptions? : FindOptionsWhere<ShopPayment> | FindManyOptions<ShopPayment>) : Promise<Pagination<ShopPayment, IPaginationMeta>> {
        return this.repository.paginate(options, searchOptions);
    }

    public async getPaymentById(id : number|string) : Promise<ShopPayment> {
        return this.repository.getPayment(id);
    }

    public async updatePaymentStatus(purchaseStatusDTO : PurchaseStatusDTO) : Promise<ShopPayment> {
        const payment : ShopPayment = await this.repository.getPayment(purchaseStatusDTO.orderId, 'orderId', ['offer','avatar']);

        if(payment.delivered === this.DELIVERED_YES || payment.status === this.COMPLETED || payment.status === this.CANCELLED) {
            throw new DuplicatePaymentException();
        } else {
            payment.status = purchaseStatusDTO.status;
            this.rconService.executeData(payment.offer.data, payment.avatar.id);
            payment.delivered = this.DELIVERED_YES;
        }

        return this.repository.save(payment);
    }

    private async getNewPayment(newPurchaseDTO : NewPurchaseDTO, loggedAvatar : Avatar) : Promise<ShopPayment> {
        const offer : ShopOffer = await this.shopOfferService.getOfferById(newPurchaseDTO.offerId);
        
        const payment : ShopPayment = new ShopPayment();
        payment.avatar = loggedAvatar;
        payment.offer = offer;
        payment.orderId = newPurchaseDTO.orderId;
        payment.payerId = newPurchaseDTO.payerId;
        payment.status = newPurchaseDTO.status;
        payment.createdAt = new Date();
        return payment;
    }
}