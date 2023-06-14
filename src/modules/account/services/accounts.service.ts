import { Injectable } from "@nestjs/common";
import { IPaginationOptions, Pagination, IPaginationMeta } from "nestjs-typeorm-paginate";
import { AccountsRepository } from "../repositories/accounts.repository";
import { Account } from "../entities/account.entity";
import { NewAccountDTO } from "../dtos/new-account.dto";
import { HashService } from "src/modules/shared/services/hash.service";
import { AvatarService } from "src/modules/avatar/services/avatar.service";
import { ClassTransformOptions } from "class-transformer";
import { extendedAccountGroupsForSerializing } from "../serializers/account.serializer";
import { extendTimestampsAvatarGroup } from "src/modules/avatar/serializers/avatar.serializer";
import { In } from "typeorm";

@Injectable()
export class AccountService {
  constructor(
      private readonly repository : AccountsRepository,
      private readonly hashService : HashService,
      private readonly avatarService : AvatarService
  ) {}

  public async createAccount(newAccountDTO : NewAccountDTO) : Promise<Account> {
    let account = await this.getNewAccount(newAccountDTO);
    const avatar = await this.avatarService.generateAvatar(account);
    account.avatars = [avatar];
    account.activeAvatar = avatar;
    return await this.save(account);
  }

  public async save(account : Account) : Promise<Account> {
    return this.repository.save(account);
  }

  public async paginateAccounts(options : IPaginationOptions) : Promise<Pagination<Account, IPaginationMeta>> {
    return this.repository.paginate(options);
  }

  public async getAccountById(id : number|string) : Promise<Account> {
    let relations : string[] = [
      'activeAvatar', 'activeAvatar.currencies', 'activeAvatar.rank'
    ];
    
    return await this.repository.getAccount(id, 'id', relations) ?? null;
  }

  public async getAccountsByIds(ids : number[]) : Promise<Account[]> {
    return await this.repository.findBy({
        id: In(ids)
    });
  }

  public async accountExists(email : string = '') : Promise<Account> {
    const transformOptions: ClassTransformOptions = {
      groups: [...extendedAccountGroupsForSerializing, ...extendTimestampsAvatarGroup]
    }

    return await this.repository.getAccount(email, 'email', ['activeAvatar'], false, transformOptions) ?? null;
  }

  public async getNewAccount(newAccountDTO : NewAccountDTO) : Promise<Account> {
    const account : Account = new Account();

    account.email = newAccountDTO.email;
    account.password = await this.hashService.hash(newAccountDTO.password);
    account.lastLogin = new Date();
    account.ip_current = newAccountDTO.ip;
    account.ip_register = newAccountDTO.ip;
    account.created_at = new Date();
    return account;
}
}