import { Module } from '@nestjs/common';
import { RolesService } from './services/roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from 'src/config/app/app-config.module';
import { Role } from './entities/role.entity';
import { RolesRepository } from './roles.repository';
import { TokenConfigModule } from 'src/config/token/token-config.module';
import { JwtService } from '@nestjs/jwt';
import { AccountsService } from '../account/services/accounts.service';
import { AccountsRepository } from '../account/accounts.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([Role]),
        TokenConfigModule,
        AppConfigModule
    ],
    controllers: [
        RolesController
    ],
    providers: [
        RolesRepository,
        RolesService,
        AccountsRepository,
        AccountsService,
        JwtService
    ],
    exports: [
        RolesService
    ]
})
export class RolesModule {}
