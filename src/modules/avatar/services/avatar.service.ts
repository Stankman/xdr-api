import { Injectable } from "@nestjs/common";
import { IPaginationOptions, Pagination, IPaginationMeta } from "nestjs-typeorm-paginate";
import { FindManyOptions } from "typeorm";
import { Avatar } from "../entities/avatar.entity";
import { AvatarsRepository } from "../repositories/avatars.repository";
import { NewAvatarDTO } from "../dtos/new-avatar.dto";
import { Account } from "src/modules/account/entities/account.entity";
import { AvatarCurrencyService } from "./avatar-currency.service";
import { XdrSettingService } from "src/modules/setting/services/xdr-setting.service";
import { AvatarCurrency } from "../entities/avatar-currency.entity";
import { Permission } from "src/modules/role/entities/permission.entity";
import { Role } from "src/modules/role/entities/role.entity";
import { RoleService } from "src/modules/role/services/role.service";

@Injectable()
export class AvatarService {
    constructor(
        private readonly repository : AvatarsRepository,
        private readonly avatarCurrencyService : AvatarCurrencyService,
        private readonly roleService : RoleService,
        private readonly xdrSettingService : XdrSettingService
    ) {}

    public async paginateAvatars(options : IPaginationOptions, searchOptions? : FindManyOptions<Avatar>) : Promise<Pagination<Avatar, IPaginationMeta>> {
        return this.repository.paginate(options, searchOptions);
    }

    public async getAvatarById(id : number|string) : Promise<Avatar> {
        return this.repository.getAvatar(id, 'id', ['settings', 'rank']);
    }

    public async generateAvatar(account : Account) : Promise<Avatar> {
        let avatar = await this.getNewAvatar(null, account);
        avatar = await this.setAvatarProperties(avatar);
        return await this.repository.save(avatar);
    }

    public async createAvatar(newAvatarDTO : NewAvatarDTO) : Promise<Avatar> {
        let avatar : Avatar = await this.getNewAvatar(newAvatarDTO);
        avatar = await this.setAvatarProperties(avatar);
        return await this.repository.save(avatar);
    }

    public async setAvatarProperties(avatar : Avatar) : Promise<Avatar> {
        const avatarCurrencies : AvatarCurrency[] = [];

        for(let currency of await this.xdrSettingService.getInitialCurrency()) {
            avatarCurrencies.push(await this.avatarCurrencyService.createAvatarCurrency(currency['type'], currency['amount']));
        }

        avatar.currencies = avatarCurrencies;

        return avatar;
    }

    public async hasPermission(avatar : Avatar, permission : Permission) : Promise<boolean> {
        const role : Role = avatar.rank.role;

        if(!role) {
            return false;
        }

        return this.roleService.hasPermission(role, permission);
    }

    private async avatarExists(username : string) : Promise<boolean> {
        return !!await this.repository.getAvatar(username, 'username', [], false);
    }

    private async generateRandomUsername(username : string, randomize : boolean = false) : Promise<string> {
        let newUsername : string = username;
        
        if(randomize) {
            newUsername = newUsername.concat(`-XDR-${ Math.floor(Math.random() * 1000) }`);
        } else {
            newUsername = newUsername.substring(0, username.indexOf('@'));

            let chars : string[] = ['-', '_', '.'];

            for(let char of chars) {
                if(!newUsername.includes(char)) {
                    continue;
                }

                newUsername = newUsername.replace(char, '');
            };
        }

        if(await this.avatarExists(newUsername)) {
            return this.generateRandomUsername(newUsername, true);
        }

        return newUsername;
    }

    private async getNewAvatar(newAvatarDTO? : NewAvatarDTO, account? : Account) : Promise<Avatar> {
        const settings : Object = await this.xdrSettingService.getInitialData();
        const avatar : Avatar = new Avatar();

        if(!newAvatarDTO && !account) {
            console.log('Throw Error');
        }

        avatar.username = newAvatarDTO ? newAvatarDTO.username : await this.generateRandomUsername(account.email);
        avatar.motto = settings['hotel.initial.motto'];
        avatar.gender = newAvatarDTO ? newAvatarDTO.gender : 'M';
        avatar.rankId = 1;
        avatar.credits = settings['hotel.initial.credits'];
        avatar.look = settings['hotel.initial.look'];
        avatar.account_created = Date.now();

        return avatar;
    }
}