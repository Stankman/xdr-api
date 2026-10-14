import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { TurboPermissionService } from '../../modules/turbo/turbo-permission.service';
import { TURBO_PERMISSION_KEY } from '../decorators/turbo-permission.decorator';
import { AuditLogService } from '../../modules/audit/audit-log.service';
import { randomUUID } from 'crypto';

@Injectable()
export class TurboPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissions: TurboPermissionService,
    private readonly audit: AuditLogService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const node = this.reflector.getAllAndOverride<string>(TURBO_PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!node) throw new ForbiddenException('A Turbo permission is required for this operation.');

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.turbo_admin_token || !request.turbo_admin_player_id) {
      throw new ForbiddenException('Turbo Admin identity has not been validated.');
    }
    try {
      await this.permissions.require(request.turbo_admin_token, request.turbo_admin_player_id, node);
    } catch (error) {
      await this.audit.record({
        actorAccountId: request.xdr_uid,
        actorPlayerId: request.turbo_admin_player_id,
        action: 'authorization.turbo_permission.denied',
        targetType: 'turbo_permission',
        targetId: node,
        result: 'failure',
        requestId: request.requestId || randomUUID(),
        details: { errorType: error instanceof Error ? error.name : 'UnknownError' },
      });
      throw error;
    }
    return true;
  }
}
