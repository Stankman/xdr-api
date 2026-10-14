import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../auth/authentication.module';
import { TurboModule } from '../turbo/turbo.module';
import { AuditController } from './audit.controller';
import { AuditStorageModule } from './audit-storage.module';

@Module({
  imports: [AuditStorageModule, AuthenticationModule, TurboModule],
  controllers: [AuditController],
  exports: [AuditStorageModule],
})
export class AuditModule {}
