import { Injectable } from "@nestjs/common";
import { Request } from "express";
import { AccountsRepository } from "../repositories/accounts.repository";
import { Account } from "../entities/account.entity";
import { ClassTransformOptions } from "@nestjs/common/interfaces/external/class-transform-options.interface";
import { defaultAvatarGroup } from "src/modules/avatar/serializers/avatar.serializer";

@Injectable()
export class AccountGuardService {
  constructor(
      private readonly repository : AccountsRepository
  ) {}

  public async getLoggedAccount(request : Request, transformOptions : ClassTransformOptions = { groups: defaultAvatarGroup }) : Promise<Account> {
    let authAccount = request['xdr_uid'];

    if(!authAccount) {
      return null;
    }

    return await this.repository.getAccount(authAccount, 'id', ['activeAvatar.currencies', 'activeAvatar.rank.role.permissions'], false, transformOptions) ?? null;
  }
}