import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Account } from './entities/account.entity';
import { Request } from 'express';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AccountsService } from './services/accounts.service';

@ApiTags('Account')
@UseGuards(AuthGuard)
@Controller('account')
export class AccountController {

    constructor(
        private readonly accountsService : AccountsService
    ) {}

    @Get()
    public async getLoggedUser(@Req() req : Request) : Promise<Account> {
        return await this.accountsService.getLoggedAccount(req);
    }
}
