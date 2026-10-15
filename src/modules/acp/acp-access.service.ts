import { ForbiddenException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import { AuditLogService } from '../audit/audit-log.service';
import { PermissionService } from '../permission/permission.service';
import { XdrPermissionNodes } from '../permission/permission-nodes';

type AcpRequest = Pick<AuthenticatedRequest, 'xdr_uid' | 'requestId'>;

@Injectable()
export class AcpAccessService {
  constructor(
    private readonly permissions: PermissionService,
    private readonly audit: AuditLogService,
  ) {}

  async eligibility(accountId: number): Promise<{ canAccessAcp: boolean }> {
    return {
      canAccessAcp: await this.permissions.has(
        accountId,
        XdrPermissionNodes.ACP_ACCESS,
      ),
    };
  }

  async authorize(request: AcpRequest): Promise<void> {
    try {
      if (
        !(await this.permissions.has(
          request.xdr_uid,
          XdrPermissionNodes.ACP_ACCESS,
        ))
      ) {
        throw new ForbiddenException('Website ACP access is required.');
      }
    } catch (error) {
      await this.audit.record({
        actorAccountId: request.xdr_uid,
        actorPlayerId: null,
        action: 'authorization.acp.denied',
        targetType: 'xdr_account',
        targetId: String(request.xdr_uid),
        result: 'failure',
        requestId: request.requestId || randomUUID(),
        details: {
          errorType: error instanceof Error ? error.name : 'UnknownError',
        },
      });
      throw error;
    }
  }
}
