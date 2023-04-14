import { Injectable } from "@nestjs/common";
import { Account } from "src/modules/account/entities/account.entity";
import { AccountsService } from "src/modules/account/services/accounts.service";
import { SignUpDTO } from "../dtos/signup.dto";
import { TokenService } from "./token.service";
import { HashService } from "./hash.service";
import { EmailTakenException } from "../exceptions/email-taken.exception";

@Injectable()
export class SignUpService {
    constructor(
        private readonly accountsService : AccountsService,
        private readonly hashService : HashService,
        private readonly tokenService : TokenService
    ) {}

    public async signUp(signUpDTO : SignUpDTO) : Promise<any> {
        let existingAccount : Account = await this.accountsService.accountExists(signUpDTO.email);

        if(existingAccount) {
            throw new EmailTakenException();
        }

        //TODO Check If IP is not banned or max accounts per IP
        
        let account = await this.accountsService.save(await this.getNewAccount(signUpDTO));

        const token = await this.tokenService.execute(account.id);

        let access_token = { 'access_token': token };

        return access_token;
    }

    private async getNewAccount(signUpDTO : SignUpDTO) : Promise<Account> {
        let account : Account = new Account();

        account.email = signUpDTO.email;
        account.password = await this.hashService.hash(signUpDTO.password);
        account.last_login = Math.floor(Date.now() / 1000);
        account.ip_current = signUpDTO.ip;
        account.ip_register = signUpDTO.ip;
        account.created_at = new Date();

        return account;
    }
}
