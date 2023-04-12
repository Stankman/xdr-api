import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from 'src/config/app/app-config.module';
import { AccountController } from './account.controller';
import { AccountsController } from './accounts.controller';
import { AccountsRepository } from './accounts.repository';
import { Account } from './entities/account.entity';
import { AccountsService } from './services/accounts.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Account]),
        AppConfigModule
    ],
    controllers: [
        AccountsController,
        AccountController
    ],
    providers: [
        AccountsRepository,
        AccountsService
    ],
    exports: [
        AccountsService
    ]
})
export class AccountModule {}
