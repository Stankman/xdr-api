import { Injectable } from "@nestjs/common";
import { Account } from "src/modules/account/entities/account.entity";
import { AccountService } from "src/modules/account/services/accounts.service";
import { Ban } from "src/modules/ban/entities/ban.entity";
import { BanService } from "src/modules/ban/services/ban.service";
import { SignInDTO } from "../dtos/signin.dto";
import { BanException } from "../exceptions/ban.exception";
import { LoginException } from "../exceptions/login.exception";
import { TokenService } from "./token.service";
import { allAccountGroupsForSerializing } from "src/modules/account/serializers/account.serializer";
import { HashService } from "src/modules/shared/services/hash.service";

@Injectable()
export class SignInService {
    constructor(
        private readonly accountsService : AccountService,
        private readonly banService : BanService,
        private readonly tokenService : TokenService,
        private readonly hashService : HashService
    ) {}

    public async signIn(signInDTO : SignInDTO) : Promise<any> {
        let account : Account = await this.accountsService.accountExists(
            signInDTO.identification, 
            {
                groups: allAccountGroupsForSerializing
            }
        );

        if(!account || !(await this.hashService.verify(account.password, signInDTO.password))) {
            throw new LoginException();
        }

        let ban : Ban = await this.banService.getBan(account.id);

        if(ban) {
            throw new BanException();
        }

        account.ip_current = signInDTO.ip;
        account.last_login = Math.floor(Date.now() / 1000);

        this.accountsService.saveAccount(account);

        const token = await this.tokenService.execute(account.id);

        let access_token = { 'access_token': token };

        return access_token;
    }
}
