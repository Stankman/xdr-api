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

@Module({
    imports: [
        TypeOrmModule.forFeature([Account]),
        TokenConfigModule,
        AppConfigModule
    ],
    controllers: [
        AccountsController,
        AccountController
    ],
    providers: [
        AccountsRepository,
        AccountsService,
        JwtService
    ],
    exports: [
        AccountsService
    ]
})
export class AccountModule {}
