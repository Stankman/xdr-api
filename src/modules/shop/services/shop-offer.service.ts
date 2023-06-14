import { Injectable } from "@nestjs/common";
import { ShopOffersRepository } from "../repositories/shop-offers.repository";
import { ShopOffer } from "../entities/shop-offer.entity";
import { IPaginationOptions, Pagination, IPaginationMeta } from "nestjs-typeorm-paginate";
import { FindManyOptions } from "typeorm";
import { NewShopOfferDTO } from "../dtos/new-shop-offer.dto";

@Injectable()
export class ShopOfferService {
    constructor(
        private readonly repository : ShopOffersRepository
    ) {}

    public async createNewOffer(newShopOfferDTO : NewShopOfferDTO) : Promise<ShopOffer> {
        const offer : ShopOffer = await this.getNewOffer(newShopOfferDTO);
        return this.repository.save(offer);
    }

    public async paginateOffers(options : IPaginationOptions, searchOptions? : FindManyOptions<ShopOffer> | FindManyOptions<ShopOffer>) : Promise<Pagination<ShopOffer, IPaginationMeta>> {
        return this.repository.paginate(options, searchOptions);
    }

    public async getOfferById(id : number|string) : Promise<ShopOffer> {
        return this.repository.getOffer(id);
    }

    private async getNewOffer(newShopOfferDTO : NewShopOfferDTO) : Promise<ShopOffer> {
        const offer : ShopOffer = new ShopOffer();
        offer.title = newShopOfferDTO.title;
        offer.description = newShopOfferDTO.description;
        offer.image = newShopOfferDTO.image;
        offer.price = newShopOfferDTO.price;
        offer.currency = newShopOfferDTO.currency;
        offer.data = newShopOfferDTO.data;
        return offer;
    }
}