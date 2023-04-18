import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from 'src/config/app/app-config.module';
import { AccountController } from './account.controller';
import { AccountsController } from './accounts.controller';
import { AccountsRepository } from './accounts.repository';
import { Account } from './entities/account.entity';
import { AccountsService } from './services/accounts.service';
import { TokenConfigModule } from 'src/config/token/token-config.module';
import { JwtService } from '@nestjs/jwt';
import { AccountSettingsService } from './services/account-settings.service';
import { HashService } from '../auth/services/hash.service';
import { Argon2ConfigModule } from 'src/config/argon2/argon2-config.module';
import { AccountsRoles } from './entities/accounts-roles.entity';
import { AccountsRolesService } from './services/accounts-roles.service';
import { RolesService } from '../role/services/roles.service';
import { AccountsRolesRepository } from './accounts-roles.repository';
import { RolesRepository } from '../role/roles.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([Account, AccountsRoles]),
        TokenConfigModule,
        AppConfigModule,
        Argon2ConfigModule
    ],
    controllers: [
        AccountsController,
        AccountController
    ],
    providers: [
        AccountsRepository,
        AccountsRolesRepository,
        
        AccountsService,
        AccountSettingsService,
        AccountsRolesService,
        RolesService,
        RolesRepository,
        HashService,
        JwtService
    ],
    exports: [
        AccountsService,
        AccountSettingsService,
        AccountsRolesService
    ]
})
export class AccountModule {}
