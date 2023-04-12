import { Injectable } from "@nestjs/common";
import { Account } from "src/modules/account/entities/account.entity";
import { AccountsService } from "src/modules/account/services/accounts.service";
import { SignUpDTO } from "../dtos/signup.dto";
import { DuplicateException } from "../exceptions/duplicate.exception";
import { TokenService } from "./token.service";
import { SignInDTO } from '../dtos/signin.dto';

@Injectable()
export class SignUpService {
    constructor(
        private readonly accountsService : AccountsService,
        private readonly tokenService : TokenService
    ) {}

    public async signUp(signUpDTO : SignUpDTO) : Promise<any> {
        let existingAccount : Account = await this.accountsService.accountExists(signUpDTO.email);

        if(existingAccount) {
            throw new DuplicateException();
        }
        
        let account = await this.accountsService.save(this.getNewUser(signUpDTO));

        const token = await this.tokenService.execute(account.id);

        let access_token = { 'access_token': token };

        return access_token;
    }

    private getNewUser(signUpDTO : SignUpDTO) : Account {
        let account : Account = new Account();

        account.email = signUpDTO.email;
        account.password = signUpDTO.password;
        account.last_login = Math.floor(Date.now() / 1000);
        account.ip_current = signUpDTO.ip;
        account.ip_register = signUpDTO.ip;
        account.created_at = new Date();

        return account;
    }
}
