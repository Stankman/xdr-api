import { Injectable } from "@nestjs/common";
import { XdrSettingsRepository } from "../repositories/xdr-settings.repository";
import { XdrSetting } from "../entities/xdr-setting.entity";
import { IPaginationOptions, Pagination, IPaginationMeta } from "nestjs-typeorm-paginate";
import { FindManyOptions, FindOptionsWhere, Like, Not } from "typeorm";
import { AvatarCurrency } from "src/modules/avatar/entities/avatar-currency.entity";

@Injectable()
export class XdrSettingService {
    constructor(
        private readonly repository : XdrSettingsRepository
    ) {}

    public async paginate(options : IPaginationOptions) : Promise<Pagination<XdrSetting, IPaginationMeta>> {
        return this.repository.paginate(options);
    }

    public async getSettingByKey(key : string) : Promise<XdrSetting> {
        return await this.repository.getSetting(key);
    }

    public async getInitialData() : Promise<Object> {
        let whereOptions : FindManyOptions<XdrSetting> = {
            where: [
                {
                    key: Like('hotel.initial%')
                }
            ]
        }

        const settings : XdrSetting[] = await this.repository.find(whereOptions);

        let initialSettings : Object = {};

        for(let setting of settings) {
            initialSettings[setting.key] = setting.value;
        }

        return initialSettings;
    }

    public async getInitialCurrency() : Promise<any[]> {
        let whereOptions : FindManyOptions<XdrSetting> = {
            where: {
                key: Like('%hotel.initial.currency.%')
            }
        }

        const settings : XdrSetting[] = await this.repository.find(whereOptions);

        const currencies = [];

        settings.forEach(element => {
            const currency = {
                type: element.key.substring(23),
                amount: element.value
            }
            currencies.push(currency);
        });

        return currencies;
    }
}