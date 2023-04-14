import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Account } from './entities/account.entity';
import { Request } from 'express';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AccountsService } from './services/accounts.service';
import { ChangePasswordDTO } from './dtos/change-password.dto';
import { AccountSettingsService } from './services/account-settings.service';

@ApiTags('Account')
@UseGuards(AuthGuard)
@Controller('account')
export class AccountController {

    constructor(
        private readonly accountsService : AccountsService,
        private readonly accountSettingsService : AccountSettingsService
    ) {}

    @Get()
    public async getLoggedUser(@Req() req : Request) : Promise<Account> {
        return await this.accountsService.getLoggedAccount(req);
    }

    @ApiBody({ type: [ChangePasswordDTO] })
    @Put('/settings/change-password')
    public async changePassword(@Req() req : Request, @Body() changePassword : ChangePasswordDTO) {
        let account : Account = await this.accountsService.getLoggedAccount(req);

        return await this.accountSettingsService.changePassword(account, changePassword);
    }
}
