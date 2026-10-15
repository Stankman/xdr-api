import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { AuditStorageModule } from '../audit/audit-storage.module';
import { AccountPermissionGroup } from './entities/account-permission-group.entity';
import { PermissionGroupNode } from './entities/permission-group-node.entity';
import { PermissionGroupParent } from './entities/permission-group-parent.entity';
import { PermissionGroup } from './entities/permission-group.entity';
import { PermissionGroupsController } from './permission-groups.controller';
import { PermissionGroupsService } from './permission-groups.service';
import { PermissionService } from './permission.service';
import { StaffDirectoryController } from './staff-directory.controller';
import { StaffDirectoryService } from './staff-directory.service';
import { AuthenticationModule } from '../auth/authentication.module';
import { AcpAccessController } from '../acp/acp-access.controller';
import { AcpAccessService } from '../acp/acp-access.service';

@Module({
  imports: [
    AuditStorageModule,
    forwardRef(() => AuthenticationModule),
    TypeOrmModule.forFeature([
      PermissionGroup,
      PermissionGroupNode,
      PermissionGroupParent,
      AccountPermissionGroup,
    ]),
  ],
  controllers: [
    PermissionGroupsController,
    AcpAccessController,
    StaffDirectoryController,
  ],
  providers: [
    PermissionService,
    PermissionGroupsService,
    StaffDirectoryService,
    PermissionGuard,
    AcpAccessService,
  ],
  exports: [
    PermissionService,
    PermissionGuard,
    AcpAccessService,
    AuditStorageModule,
  ],
})
export class PermissionModule {}
