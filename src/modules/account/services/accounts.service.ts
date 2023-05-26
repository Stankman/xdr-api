import { Injectable } from "@nestjs/common";
import { IPaginationOptions, Pagination, IPaginationMeta } from "nestjs-typeorm-paginate";
import { FindOptionsWhere, In } from "typeorm";
import { AccountsRepository } from "../repositories/accounts.repository";
import { Account } from "../entities/account.entity";
import { Request } from "express";
import { NewAccountDTO } from "../dtos/new-account.dto";
import { HashService } from "src/modules/shared/services/hash.service";
import { AvatarService } from "src/modules/avatar/services/avatar.service";

@Injectable()
export class AccountService {
  constructor(
      private readonly repository : AccountsRepository,
      private readonly hashService : HashService,
      private readonly avatarService : AvatarService
  ) {}

  public async getLoggedAccount(request : Request) : Promise<Account> {
    let authAccount = request['xdr_uid'];

    if(!authAccount) {
      return null;
    }

    return await this.getAccountById(authAccount, true) ?? null;
  }

  public async createAccount(newAccountDTO : NewAccountDTO) : Promise<Account> {
    let account = await this.getNewAccount(newAccountDTO);

    account.active_avatar = await this.avatarService.generateAvatar(account);

    return await this.saveAccount(account);
  }

  public async saveAccount(account : Account) : Promise<Account> {
    return this.repository.save(account);
  }

  public async paginateAccounts(options : IPaginationOptions) : Promise<Pagination<Account, IPaginationMeta>> {
    return this.repository.paginate(options);
  }

  public async getAccountById(id : number|string, withRoles : boolean = false) : Promise<Account> {
    let relations : string[] = [];

    if(withRoles) {
      relations.push('roles');
    }
    
    return await this.repository.getAccount(id, 'id', relations) ?? null;
  }

  public async getAccountsByIds(ids : number[]) : Promise<Account[]> {
    return await this.repository.findBy({
        id: In(ids)
    });
  }

  public async accountExists(email : string = '', transformOptions : any = {}, throwErrors : boolean = false) : Promise<Account> {
    return await this.repository.getAccount(email, 'email', [], throwErrors, transformOptions) ?? null;
  }

  public async getNewAccount(newAccountDTO : NewAccountDTO) : Promise<Account> {
    const account : Account = new Account();

    account.email = newAccountDTO.email;
    account.password = await this.hashService.hash(newAccountDTO.password);
    account.last_login = Math.floor(Date.now() / 1000);
    account.ip_current = newAccountDTO.ip;
    account.ip_register = newAccountDTO.ip;
    account.created_at = new Date();

    return account;
}
}