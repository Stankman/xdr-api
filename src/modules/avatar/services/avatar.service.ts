import { Injectable } from "@nestjs/common";
import { IPaginationOptions, Pagination, IPaginationMeta } from "nestjs-typeorm-paginate";
import { FindOptionsWhere, FindManyOptions } from "typeorm";
import { Avatar } from "../entities/avatar.entity";
import { AvatarsRepository } from "../repositories/avatars.repository";
import { NewAvatarDTO } from "../dtos/new-avatar.dto";
import { Account } from "src/modules/account/entities/account.entity";
import { AvatarSettingsService } from "./avatar-settings.service";
import { AvatarCurrencyService } from "./avatar-currency.service";
import { XdrSettingService } from "src/modules/setting/services/xdr-setting.service";
import { XdrSetting } from "src/modules/setting/entities/xdr-setting.entity";

@Injectable()
export class AvatarService {
    constructor(
        private readonly repository : AvatarsRepository,
        private readonly avatarSettingsService : AvatarSettingsService,
        private readonly avatarCurrencyService : AvatarCurrencyService,
        private readonly xdrSettingService : XdrSettingService
    ) {}

    public async paginateAvatars(options : IPaginationOptions, searchOptions? : FindOptionsWhere<Avatar> | FindManyOptions<Avatar>) : Promise<Pagination<Avatar, IPaginationMeta>> {
        return this.repository.paginate(options, searchOptions);
    }

    public async getAvatarById(id : number|string) : Promise<Avatar> {
        return this.repository.getAvatar(id, 'id', ['settings']);
    }

    public async generateAvatar(account : Account) : Promise<Avatar> {
        let settings : Object = await this.xdrSettingService.getInitialData();
        let avatar = await this.getNewAvatar(settings, null, account);
        avatar = await this.saveAvatar(avatar);

        await this.avatarSettingsService.createAvatarSettings(avatar);

        for(let currency of await this.xdrSettingService.getInitialCurrency()) {
            await this.avatarCurrencyService.createAvatarCurrency(currency['type'], currency['amount'], avatar);
        }

        return avatar;
    }

    public async createAvatar(newAvatarDTO : NewAvatarDTO, account : Account) : Promise<Avatar> {
        let settings : Object = await this.xdrSettingService.getInitialData();
        let avatar : Avatar = await this.getNewAvatar(settings, newAvatarDTO);
        avatar = await this.saveAvatar(avatar);
        await this.avatarSettingsService.createAvatarSettings(avatar);
        return avatar;
    }

    public async saveAvatar(avatar : Avatar) : Promise<Avatar> {
        return this.repository.save(avatar);
    }

    private async checkUsernameAvailability(username : string) : Promise<boolean> {
        return !!this.repository.getAvatar(username, 'username', [], false);
    }

    private async generateRandomUsername(username : string, randomize : boolean = false) : Promise<string> {
        let newUsername : string;
        
        if(randomize) {
            newUsername = newUsername.concat(`- ${ Math.floor(Math.random() * 100) }`);
        } else {
            newUsername = username.substring(0, username.indexOf('@'));

            let chars : string[] = ['-', '_', '.'];

            for(let char of chars) {
                if(!newUsername.includes(char)) {
                    continue;
                }

                newUsername = newUsername.replace(char, '');
            };
        }

        if(!this.checkUsernameAvailability(newUsername)) {
            return this.generateRandomUsername(newUsername, true);
        }

        return newUsername;
    }

    private async getNewAvatar(settings : Object, newAvatarDTO? : NewAvatarDTO, account? : Account) : Promise<Avatar> {
        const avatar : Avatar = new Avatar();

        if(!newAvatarDTO && !account) {
            console.log('Throw Error');
        }

        avatar.username = newAvatarDTO ? newAvatarDTO.username : await this.generateRandomUsername(account.email);
        avatar.motto = settings['hotel.initial.motto'];
        avatar.gender = 'M';
        avatar.rank = 1;
        avatar.credits = settings['hotel.initial.credits'];
        avatar.account = account;

        return avatar;
    }
}