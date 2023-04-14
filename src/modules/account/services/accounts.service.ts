import { Injectable } from "@nestjs/common";
import { IPaginationOptions, Pagination, IPaginationMeta } from "nestjs-typeorm-paginate";
import { FindOptionsWhere } from "typeorm";
import { AccountsRepository } from "../accounts.repository";
import { Account } from "../entities/account.entity";
import { Request } from "express";

@Injectable()
export class AccountsService {
  constructor(
      private readonly repository : AccountsRepository
  ) {}

  public async getLoggedAccount(request : Request) : Promise<Account> {
    let authAccount = request['xdr_uid'];

    if(!authAccount) {
      return null;
    }

    return await this.repository.getAccount(authAccount) ?? null;
  }

  public async save(account : Account) : Promise<Account> {
    return this.repository.save(account);
  }

  public async paginateAccounts(options : IPaginationOptions) : Promise<Pagination<Account, IPaginationMeta>> {
    return this.repository.paginate(options);
  }

  public async getAccountById(id : number|string) : Promise<Account> {
    return await this.repository.getAccount(id) ?? null;
  }

  public async accountExists(email : string = '', transformOptions : any = {}) : Promise<Account> {
    return await this.repository.getAccount(email, 'email', true, transformOptions) ?? null;
  }
}