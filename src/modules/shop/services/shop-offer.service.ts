import { Injectable } from "@nestjs/common";
import { ShopOffersRepository } from "../repositories/shop-offers.repository";
import { ShopOffer } from "../entities/shop-offer.entity";
import { IPaginationOptions, Pagination, IPaginationMeta } from "nestjs-typeorm-paginate";
import { FindOptionsWhere, FindManyOptions } from "typeorm";

@Injectable()
export class ShopOfferService {
    constructor(
        private readonly repository : ShopOffersRepository
    ) {}

    public async createNewOffer(shopOfferDTO : ShopOfferDTO) : Promise<ShopOffer> {
        const offer : ShopOffer = await this.getNewOffer(shopOfferDTO);
        return this.repository.save(offer);
    }

    public async paginateOffers(options : IPaginationOptions, searchOptions? : FindOptionsWhere<ShopOffer> | FindManyOptions<ShopOffer>) : Promise<Pagination<ShopOffer, IPaginationMeta>> {
        return this.repository.paginate(options, searchOptions);
    }

    public async getOfferById(id : number|string) : Promise<ShopOffer> {
        return this.repository.getOffer(id);
    }

    private async getNewOffer(shopOfferDTO : ShopOfferDTO) : Promise<ShopOffer> {
        const offer : ShopOffer = new ShopOffer();
        offer.title = shopOfferDTO.title;
        offer.description = shopOfferDTO.description;
        offer.image = shopOfferDTO.image;
        offer.price = shopOfferDTO.price;
        offer.data = shopOfferDTO.data; //TODO Maybe JSON to string
        return offer;
    }
}