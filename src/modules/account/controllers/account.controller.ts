import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Account } from '../entities/account.entity';
import { Request } from 'express';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { AccountService } from '../services/accounts.service';
import { ChangePasswordDTO } from '../dtos/change-password.dto';
import { AccountSettingsService } from '../services/account-settings.service';
import { ChangeEmailDTO } from '../dtos/change-email.dto';

@ApiTags('Account')
@UseGuards(AuthGuard)
@Controller('account')
export class AccountController {

    constructor(
        private readonly accountsService : AccountService,
        private readonly accountSettingsService : AccountSettingsService
    ) {}

    @Get()
    public async getLoggedAccount(@Req() req : Request) : Promise<Account> {
        return await this.accountsService.getLoggedAccount(req);
    }

    @ApiBody({ type: [ChangePasswordDTO] })
    @Put('/settings/change-password')
    public async changePassword(@Req() req : Request, @Body() changePassword : ChangePasswordDTO) {
        let account : Account = await this.accountsService.getLoggedAccount(req);

        return await this.accountSettingsService.changePassword(account, changePassword);
    }

    @ApiBody({ type: [ChangeEmailDTO] })
    @Put('/settings/change-email')
    public async changeEmail(@Req() req : Request, @Body() changeEmail : ChangeEmailDTO) {
        let account : Account = await this.accountsService.getLoggedAccount(req);

        return await this.accountSettingsService.changeEmail(account, changeEmail);
    }
}
