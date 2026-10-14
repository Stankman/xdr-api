import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../auth/authentication.module';
import { TurboConfigModule } from '../../config/turbo/turbo-config.module';
import { TurboAdminController } from './turbo-admin.controller';
import { TurboAdminGuard } from '../../common/guards/turbo-admin.guard';
import { TurboPermissionGuard } from '../../common/guards/turbo-permission.guard';
import { AuditStorageModule } from '../audit/audit-storage.module';

@Module({
  imports: [AuthenticationModule, TurboConfigModule, AuditStorageModule],
  controllers: [TurboAdminController],
  providers: [TurboAdminGuard, TurboPermissionGuard],
  exports: [TurboConfigModule, TurboAdminGuard, TurboPermissionGuard],
})
export class TurboModule {}
