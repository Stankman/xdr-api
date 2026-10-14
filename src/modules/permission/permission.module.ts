import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { AuditStorageModule } from '../audit/audit-storage.module';
import { AccountPermissionGroup } from './entities/account-permission-group.entity';
import { PermissionGroupNode } from './entities/permission-group-node.entity';
import { PermissionGroup } from './entities/permission-group.entity';
import { PermissionService } from './permission.service';

@Module({
  imports: [
    AuditStorageModule,
    TypeOrmModule.forFeature([
      PermissionGroup,
      PermissionGroupNode,
      AccountPermissionGroup,
    ]),
  ],
  providers: [PermissionService, PermissionGuard],
  exports: [PermissionService, PermissionGuard, AuditStorageModule],
})
export class PermissionModule {}
