import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { randomUUID } from 'crypto';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { XDR_PERMISSION_KEY } from '../decorators/permission.decorator';
import { PermissionService } from '../../modules/permission/permission.service';
import { AuditLogService } from '../../modules/audit/audit-log.service';
import { AcpAccessService } from '../../modules/acp/acp-access.service';

/** Runs after AuthGuard. Any doubt (no node, no account, lookup failure) is a denial. */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissions: PermissionService,
    private readonly audit: AuditLogService,
    private readonly acp: AcpAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const node = this.reflector.getAllAndOverride<string>(XDR_PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!node)
      throw new ForbiddenException(
        'A permission is required for this operation.',
      );

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!Number.isSafeInteger(request.xdr_uid) || request.xdr_uid < 1) {
      throw new ForbiddenException(
        'Website account has not been authenticated.',
      );
    }

    let granted = false;
    let errorType: string | null = null;
    try {
      granted = await this.permissions.has(request.xdr_uid, node);
    } catch (error) {
      errorType = error instanceof Error ? error.name : 'UnknownError';
    }
    if (granted) {
      await this.acp.authorize(request);
      return true;
    }

    try {
      await this.audit.record({
        actorAccountId: request.xdr_uid,
        actorPlayerId: null,
        action: 'authorization.permission.denied',
        targetType: 'xdr_permission',
        targetId: node,
        result: 'failure',
        requestId: request.requestId || randomUUID(),
        details: errorType ? { errorType } : null,
      });
    } catch {
      // The denial stands even when it cannot be recorded.
    }
    throw new ForbiddenException(`Permission '${node}' is required.`);
  }
}
