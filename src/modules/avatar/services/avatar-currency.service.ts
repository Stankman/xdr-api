import { Injectable } from "@nestjs/common";
import { AvatarCurrency } from "../entities/avatar-currency.entity";
import { Avatar } from "../entities/avatar.entity";
import { AvatarsCurrencyRepository } from "../repositories/avatars-currency.repository";

@Injectable()
export class AvatarCurrencyService {
    constructor(
        private readonly repository : AvatarsCurrencyRepository
    ) {}

    public async createAvatarCurrency(type : number, amount : number, avatar : Avatar) : Promise<AvatarCurrency> {
        let currency : AvatarCurrency = await this.getNewAvatarCurrency(type, amount, avatar);
        return this.saveAvatarCurrency(currency)
    }

    public async saveAvatarCurrency(currency : AvatarCurrency) : Promise<AvatarCurrency> {
        return this.repository.save(currency);
    }

    private async getNewAvatarCurrency(type: number, amount: number, avatar : Avatar) : Promise<AvatarCurrency> {
        let currency : AvatarCurrency = new AvatarCurrency();
        currency.avatar = avatar;
        currency.type = type;
        currency.amount = amount;
        return currency;
    }
}