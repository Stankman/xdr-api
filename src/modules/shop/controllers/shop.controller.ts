import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ShopOfferService } from '../services/shop-offer.service';
import { ShopPaymentService } from '../services/shop-payment.service';
import { Pagination, IPaginationMeta, IPaginationOptions } from 'nestjs-typeorm-paginate';
import { ShopOffer } from '../entities/shop-offer.entity';
import { ShopPayment } from '../entities/shop-payment.entity';
import { AppConfigService } from 'src/config/app/app-config.service';
import { FindManyOptions } from 'typeorm';
import { NewPurchaseDTO } from '../dtos/new-purchase.dto';
import { PurchaseStatusDTO } from '../dtos/purchase-status.dto';
import { NewShopOfferDTO } from '../dtos/new-shop-offer.dto';
import { Avatar } from 'src/modules/avatar/entities/avatar.entity';
import { Account } from 'src/modules/account/entities/account.entity';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { AccountGuardService } from 'src/modules/account/services/account-guard.service';

@ApiTags('Shop')
@UseGuards(AuthGuard)
@Controller('shop')
export class ShopController {
    constructor(
        private readonly accountGuardService : AccountGuardService,
        private readonly shopOfferService : ShopOfferService,
        private readonly shopPaymentService : ShopPaymentService,
        private readonly appConfigService : AppConfigService
    ) {}

    @Get('offers/all')
    public async getPaginatedOffers(
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
    public async createOffer(@Body() newShopOfferDTO : NewShopOfferDTO) : Promise<ShopOffer> {
        return this.shopOfferService.createNewOffer(newShopOfferDTO);
    }

    @Post('purchase')
    public async makePayment(@Req() req : Request, @Body() newPurchaseDTO : NewPurchaseDTO) : Promise<ShopPayment> {
        const loggedAccount : Account = (await this.accountGuardService.getLoggedAccount(req));
        const loggedAvatar : Avatar = loggedAccount.active_avatar;
        return this.shopPaymentService.createNewPayment(newPurchaseDTO, loggedAvatar);
    }

    @Put('purchase')
    public async updatePaymentStatus(@Body() purchaseStatusDTO : PurchaseStatusDTO) : Promise<ShopPayment> {
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