import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { AuditQueryDto } from './dtos/audit-query.dto';
import { AuditLogService } from './audit-log.service';

@ApiTags('Administrative audit')
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@RequirePermission('cms.audit.view')
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
