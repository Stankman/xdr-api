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

    let account = this.findAccount(authAccount);

    if(!account) {
      return null;
    }

    return account;
  }

  public async save(account : Account) : Promise<Account> {
    return this.repository.save(account);
  }

  public async paginateAccounts(options : IPaginationOptions) : Promise<Pagination<Account, IPaginationMeta>> {
    return this.repository.paginate(options);
  }

  public async findAccount(value : string | number) : Promise<Account> {
    let whereOptions : FindOptionsWhere<Account> | FindOptionsWhere<Account>[] = [
      { id: !isNaN(Number(value)) ? Number(value) : 0 },
      { email: String(value) }
    ];

    return this.repository.getOneBy(whereOptions);
  }

  public async accountExists(email : string = '') : Promise<Account> {
    let whereOptions : FindOptionsWhere<Account> | FindOptionsWhere<Account>[] = [
      { email: email }
    ];
    
    return this.repository.getOneBy(whereOptions, [], false);
  }
}