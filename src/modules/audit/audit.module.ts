import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../auth/authentication.module';
import { PermissionModule } from '../permission/permission.module';
import { AuditController } from './audit.controller';
import { AuditStorageModule } from './audit-storage.module';

@Module({
  imports: [AuditStorageModule, AuthenticationModule, PermissionModule],
  controllers: [AuditController],
  exports: [AuditStorageModule],
})
export class AuditModule {}
