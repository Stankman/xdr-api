import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from 'src/config/app/app-config.module';
import { TokenConfigModule } from 'src/config/token/token-config.module';
import { AccountsRepository } from '../account/accounts.repository';
import { AccountsService } from '../account/services/accounts.service';
import { RolePermission } from './entities/role-permission.entity';
import { RolePermissionsController } from './role-permissions.controller';
import { RolePermissionsRepository } from './role-permissions.repository';
import { RolePermissionsService } from './services/role-permissions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RolePermission]),
    TokenConfigModule,
    AppConfigModule
],
controllers: [
    RolePermissionsController
],
providers: [
    RolePermissionsRepository,
    RolePermissionsService,
    AccountsRepository,
    AccountsService,
    JwtService
],
exports: [
    RolePermissionsService
]
})
export class RolePermissionsModule {}
