import { Controller, Get, Query, DefaultValuePipe, ParseIntPipe } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Pagination, IPaginationMeta, IPaginationOptions } from "nestjs-typeorm-paginate";
import { AppConfigService } from "src/config/app/app-config.service";
import { Account } from "./entities/account.entity";
import { AccountsService } from "./services/accounts.service";

@ApiTags('Accounts')
@Controller('accounts')
export class AccountsController {
    
    constructor(
        private readonly accountsService : AccountsService,
        private readonly appConfigService : AppConfigService
    ) {}

    @Get('all')
    public async paginateAccounts(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page : number = 1, 
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit : number = 10
    ) : Promise<Pagination<Account, IPaginationMeta>> {
        let options : IPaginationOptions = {
            page: page,
            limit: limit,
            route: this.appConfigService.fullUrl
        };

        return await this.accountsService.paginateAccounts(options);
    }

    @Get('find')
    public async getAccount(
        @Query('value', new DefaultValuePipe('0')) value : string = '0'
    ) : Promise<Account> {
        return await this.accountsService.getAccountById(value);
    }
}
