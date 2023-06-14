import { Injectable } from "@nestjs/common";
import { Request } from "express";
import { AccountsRepository } from "../repositories/accounts.repository";
import { Account } from "../entities/account.entity";

@Injectable()
export class AccountGuardService {
  constructor(
      private readonly repository : AccountsRepository
  ) {}

  public async getLoggedAccount(request : Request) : Promise<Account> {
    let authAccount = request['xdr_uid'];

    if(!authAccount) {
      return null;
    }

    return await this.repository.getAccount(authAccount, 'id', ['activeAvatar', 'activeAvatar.rank.role.permissions'], false) ?? null;
  }
}