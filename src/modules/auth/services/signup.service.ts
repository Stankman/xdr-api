import { Injectable } from "@nestjs/common";
import { Account } from "src/modules/account/entities/account.entity";
import { AccountService } from "src/modules/account/services/accounts.service";
import { TokenService } from "./token.service";
import { EmailTakenException } from "../exceptions/email-taken.exception";
import { NewAccountDTO } from "src/modules/account/dtos/new-account.dto";

@Injectable()
export class SignUpService {
    constructor(
        private readonly accountService : AccountService,
        private readonly tokenService : TokenService
    ) {}

    public async signUp(newAccountDTO : NewAccountDTO) : Promise<any> {
        let existingAccount : Account = await this.accountService.accountExists(newAccountDTO.email);

        if(existingAccount) {
            throw new EmailTakenException();
        }

        //TODO Check If IP is not banned or max accounts per IP

        let account : Account = await this.accountService.createAccount(newAccountDTO);

        const token = await this.tokenService.execute(account.id);

        let access_token = { 'access_token': token };

        return access_token;
    }
}
