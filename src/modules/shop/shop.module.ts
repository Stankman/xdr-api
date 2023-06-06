import { ShopController } from './controllers/shop.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { ShopOfferService } from './services/shop-offer.service';
import { ShopPaymentService } from './services/shop-payment.service';
import { ShopOffersRepository } from './repositories/shop-offers.repository';
import { ShopPaymentsRepository } from './repositories/shop-payments.repository';
import { AppConfigModule } from 'src/config/app/app-config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopOffer } from './entities/shop-offer.entity';
import { ShopPayment } from './entities/shop-payment.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ShopOffer,
            ShopPayment
        ]),
        AppConfigModule
    ],
    controllers: [ShopController],
    providers: [
        ShopOfferService,
        ShopPaymentService,
        ShopOffersRepository,
        ShopPaymentsRepository
    ],
    exports: [
        ShopOfferService,
        ShopPaymentService,
        ShopOffersRepository,
        ShopPaymentsRepository
    ]
})
export class ShopModule {}
