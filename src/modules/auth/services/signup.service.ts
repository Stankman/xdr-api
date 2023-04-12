import { Injectable } from "@nestjs/common";
import { Account } from "src/modules/account/entities/account.entity";
import { AccountsService } from "src/modules/account/services/accounts.service";
import { SignUpDTO } from "../dtos/signup.dto";
import { DuplicateException } from "../exceptions/duplicate.exception";
import { TokenService } from "./token.service";

@Injectable()
export class SignUpService {
    constructor(
        private readonly accountsService : AccountsService,
        private readonly tokenService : TokenService
    ) {}

    public async signUp(signUpDTO : SignUpDTO, currentIp : string) : Promise<any> {
        let existingAccount : Account = await this.accountsService.accountExists(signUpDTO.email);

        if(existingAccount) {
            throw new DuplicateException();
        }

        let account : Account = new Account();

        account.email = signUpDTO.email;
        account.password = signUpDTO.password;
        account.ip_current = currentIp;
        account.ip_register = currentIp;
        
        account = await this.accountsService.createAccount(account);

        const token = await this.tokenService.execute(account.id);

        let access_token = { 'access_token': token };

        return access_token;
    }
}
