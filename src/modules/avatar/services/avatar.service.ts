import { Injectable } from "@nestjs/common";
import { IPaginationOptions, Pagination, IPaginationMeta } from "nestjs-typeorm-paginate";
import { FindOptionsWhere, FindManyOptions } from "typeorm";
import { Avatar } from "../entities/avatar.entity";
import { AvatarsRepository } from "../repositories/avatars.repository";
import { NewAvatarDTO } from "../dtos/new-avatar.dto";
import { Account } from "src/modules/account/entities/account.entity";

@Injectable()
export class AvatarService {
    constructor(
        private readonly repository : AvatarsRepository
    ) {}

    public async paginateAvatars(options : IPaginationOptions, searchOptions? : FindOptionsWhere<Avatar> | FindManyOptions<Avatar>) : Promise<Pagination<Avatar, IPaginationMeta>> {
        return this.repository.paginate(options, searchOptions);
    }

    public async generateAvatar(account : Account) : Promise<Avatar> {
        return this.saveAvatar(await this.getNewAvatar(null, account));
    }

    public async createAvatar(newAvatarDTO : NewAvatarDTO) : Promise<Avatar> {
        return this.saveAvatar(await this.getNewAvatar(newAvatarDTO));
    }

    public async saveAvatar(avatar : Avatar) : Promise<Avatar> {
        return this.repository.save(avatar);
    }

    private async checkUsernameAvailability(username : string) : Promise<boolean> {
        return !!this.repository.getAvatar(username, 'username', [], false);
    }

    /**TODO MAKE THIS PRIVATE */
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

    public async getNewAvatar(newAvatarDTO? : NewAvatarDTO, account? : Account) : Promise<Avatar> {
        const avatar : Avatar = new Avatar();

        if(!newAvatarDTO && !account) {
            console.log('Throw Error');
        }

        avatar.username = newAvatarDTO.username ?? await this.generateRandomUsername(account.email);

        avatar.account = account;

        return avatar;
    }
}