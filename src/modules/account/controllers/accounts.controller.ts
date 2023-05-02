import { Controller, Get, Query, DefaultValuePipe, ParseIntPipe, UseGuards, Body, Post, Req } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Pagination, IPaginationMeta, IPaginationOptions } from "nestjs-typeorm-paginate";
import { AppConfigService } from "src/config/app/app-config.service";
import { Account } from "../entities/account.entity";
import { AccountsService } from "../services/accounts.service";
import { Permission } from "src/common/decorators/permission.decorator";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { AuthGuard } from '../../../common/guards/auth.guard';
import { AccountsRolesService } from "../services/accounts-roles.service";
import { AssignRoleDTO } from "../dtos/assign-role.dto";

@ApiTags('Accounts')
@Controller('accounts')
export class AccountsController {
    
    constructor(
        private readonly accountsService : AccountsService,
        private readonly accountsRolesService : AccountsRolesService,
        private readonly appConfigService : AppConfigService
    ) {}

    @Permission('view-accounts')
    @UseGuards(AuthGuard, RolesGuard)
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

    @Post('/assign/role')
    public async assignRole(@Req() req : Request, @Body() assignRoleDTO : AssignRoleDTO) {
        return await this.accountsRolesService.assignRole(assignRoleDTO);
    }
}
