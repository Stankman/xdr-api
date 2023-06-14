import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AvatarModule } from "../avatar/avatar.module";
import { RconModule } from "../rcon/rcon.module";
import { SharedModule } from "../shared/shared.module";
import { ShopController } from "./controllers/shop.controller";
import { ShopOffer } from "./entities/shop-offer.entity";
import { ShopPayment } from "./entities/shop-payment.entity";
import { ShopOffersRepository } from "./repositories/shop-offers.repository";
import { ShopPaymentsRepository } from "./repositories/shop-payments.repository";
import { ShopOfferService } from "./services/shop-offer.service";
import { ShopPaymentService } from "./services/shop-payment.service";

@Module({
    imports: [
        AvatarModule,
        RconModule,
        SharedModule,
        TypeOrmModule.forFeature([ShopOffer, ShopPayment])
    ],
    controllers: [
        ShopController
    ],
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
