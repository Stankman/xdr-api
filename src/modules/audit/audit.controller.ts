import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { TurboAdminGuard } from '../../common/guards/turbo-admin.guard';
import { TurboPermissionGuard } from '../../common/guards/turbo-permission.guard';
import { RequireTurboPermission } from '../../common/decorators/turbo-permission.decorator';
import { AuditQueryDto } from './dtos/audit-query.dto';
import { AuditLogService } from './audit-log.service';

@ApiTags('Administrative audit')
@ApiBearerAuth()
@ApiSecurity('TurboAdminToken')
@ApiHeader({ name: 'X-Turbo-Admin-Token', required: true })
@UseGuards(AuthGuard, TurboAdminGuard, TurboPermissionGuard)
@RequireTurboPermission('cms.audit.view')
@Controller('admin/audit-logs')
export class AuditController {
  constructor(private readonly auditLogs: AuditLogService) {}

  @Get()
  query(@Query() query: AuditQueryDto) {
    return this.auditLogs.query({
      page: query.page,
      limit: query.limit,
      actorAccountId: query.actorAccountId,
      action: query.action,
      targetType: query.targetType,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
    });
  }
}
