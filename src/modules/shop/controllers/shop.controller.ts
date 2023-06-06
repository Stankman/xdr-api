import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ShopOfferService } from '../services/shop-offer.service';
import { ShopPaymentService } from '../services/shop-payment.service';
import { Pagination, IPaginationMeta, IPaginationOptions } from 'nestjs-typeorm-paginate';
import { ShopOffer } from '../entities/shop-offer.entity';
import { ShopPayment } from '../entities/shop-payment.entity';
import { AppConfigService } from 'src/config/app/app-config.service';
import { FindManyOptions } from 'typeorm';
import { NewPurchaseDTO } from '../dtos/new-purchase.dto';
import { ShopOfferDTO } from '../dtos/shop-offer.dto';
import { PurchaseStatusDTO } from '../dtos/purchase-status.dto';

@ApiTags('Shop')
@Controller('shop')
export class ShopController {
    constructor(
        private readonly shopOfferService : ShopOfferService,
        private readonly shopPaymentService : ShopPaymentService,
        private readonly appConfigService : AppConfigService
    ) {}

    @Get('offers/all')
    public async paginateShopOffers(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page : number = 1, 
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit : number = 10
    ) : Promise<Pagination<ShopOffer, IPaginationMeta>> {
        let options : IPaginationOptions = {
            page: page,
            limit: limit,
            route: this.appConfigService.fullUrl
        };

        let searchOptions : FindManyOptions<ShopOffer> = {}

        return await this.shopOfferService.paginateOffers(options, searchOptions);
    }

    @Get('payments/all')
    public async paginateShopPayments(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page : number = 1, 
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit : number = 10
    ) : Promise<Pagination<ShopPayment, IPaginationMeta>> {
        let options : IPaginationOptions = {
            page: page,
            limit: limit,
            route: this.appConfigService.fullUrl
        };

        let searchOptions : FindManyOptions<ShopPayment> = {}

        return await this.shopPaymentService.paginatePayments(options, searchOptions);
    }

    @Post('offers')
    public async createOffer(@Body() shopOfferDTO : ShopOfferDTO) : Promise<ShopOffer> {
        return this.shopOfferService.createNewOffer(shopOfferDTO);
    }

    @Post('purchase')
    public async purchaseOffer(@Body() newPurchaseDTO : NewPurchaseDTO) : Promise<ShopPayment> {
        return this.shopPaymentService.createNewPayment(newPurchaseDTO);
    }

    @Put('purchase')
    public async updatePurchaseStatus(@Body() purchaseStatusDTO : PurchaseStatusDTO) : Promise<ShopPayment> {
        return this.shopPaymentService.updatePaymentStatus(purchaseStatusDTO);
    }

    @Get('offer/:id')
    public async getOffer(@Param() params : any) : Promise<ShopOffer> {
        return this.shopOfferService.getOfferById(params.id);
    }

    @Get('payment/:id')
    public async getPayment(@Param() params : any) : Promise<ShopPayment> {
        return this.shopPaymentService.getPaymentById(params.id);
    }
}
