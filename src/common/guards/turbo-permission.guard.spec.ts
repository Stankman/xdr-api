import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { TurboPermissionGuard } from './turbo-permission.guard';
import { TurboPermissionService } from '../../modules/turbo/turbo-permission.service';
import { AuditLogService } from '../../modules/audit/audit-log.service';

describe('TurboPermissionGuard', () => {
  it('fails closed and audits a denied or unavailable Turbo permission check', async () => {
    const handler = () => undefined;
    const request = {
      xdr_uid: 42,
      requestId: 'f5c87ae0-1e12-4e25-9ae0-3ec8c44182c5',
      turbo_admin_token: 'individual-session-token',
      turbo_admin_player_id: 17,
    } as AuthenticatedRequest;
    const context = {
      getHandler: () => handler,
      getClass: () => class TestController {},
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue('cms.articles.manage'),
    };
    const permissionError = new ForbiddenException('Unregistered Turbo permission.');
    const permissions = { require: jest.fn().mockRejectedValue(permissionError) };
    const audit = { record: jest.fn().mockResolvedValue(undefined) };
    const guard = new TurboPermissionGuard(
      reflector as unknown as Reflector,
      permissions as unknown as TurboPermissionService,
      audit as unknown as AuditLogService,
    );

    await expect(guard.canActivate(context)).rejects.toBe(permissionError);
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        actorAccountId: 42,
        actorPlayerId: 17,
        action: 'authorization.turbo_permission.denied',
        targetId: 'cms.articles.manage',
        result: 'failure',
        requestId: request.requestId,
      }),
    );
  });
});
