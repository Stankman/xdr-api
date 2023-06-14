import { Controller, Get, Query, DefaultValuePipe, ParseIntPipe, UseGuards, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Pagination, IPaginationMeta, IPaginationOptions } from "nestjs-typeorm-paginate";
import { AppConfigService } from "src/config/app/app-config.service";
import { Account } from "../entities/account.entity";
import { AccountService } from "../services/accounts.service";
import { RolePermission } from "src/common/decorators/role-permission.decorator";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { AuthGuard } from '../../../common/guards/auth.guard';

@ApiTags('Accounts')
@UseGuards(AuthGuard, RolesGuard)
@Controller('accounts')
export class AccountsController {
    
    constructor(
        private readonly accountsService : AccountService,
        private readonly appConfigService : AppConfigService
    ) {}

    @RolePermission('manage-accounts')
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

    @RolePermission('manage-accounts')
    @Get(':id')
    public async getAccount(@Param() params : any) : Promise<Account> {
        return await this.accountsService.getAccountById(params.id);
    }
}