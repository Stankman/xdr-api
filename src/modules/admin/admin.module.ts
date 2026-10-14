import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../auth/authentication.module';
import { AuditStorageModule } from '../audit/audit-storage.module';
import { TurboModule } from '../turbo/turbo.module';
import { StaffAccountSessionsController } from './staff-account-sessions.controller';
import { StaffAccountSessionsService } from './staff-account-sessions.service';

@Module({
  imports: [AuthenticationModule, AuditStorageModule, TurboModule],
  controllers: [StaffAccountSessionsController],
  providers: [StaffAccountSessionsService],
})
export class AdminModule {}
