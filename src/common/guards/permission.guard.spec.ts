import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionGuard } from './permission.guard';
import { XDR_PERMISSION_KEY } from '../decorators/permission.decorator';

describe('PermissionGuard', () => {
  const handler = () => undefined;
  class Controller {}

  function setup(
    node: string | undefined,
    has: jest.Mock,
    xdrUid: number | undefined = 7,
  ) {
    const reflector = new Reflector();
    if (node) Reflect.defineMetadata(XDR_PERMISSION_KEY, node, handler);
    else Reflect.deleteMetadata(XDR_PERMISSION_KEY, handler);
    const audit = { record: jest.fn().mockResolvedValue(undefined) };
    const acp = { authorize: jest.fn().mockResolvedValue(undefined) };
    const guard = new PermissionGuard(
      reflector,
      { has } as never,
      audit as never,
      acp as never,
    );
    const request = { xdr_uid: xdrUid, requestId: 'req-1' };
    const context = {
      getHandler: () => handler,
      getClass: () => Controller,
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    return { guard, audit, acp, context };
  }

  it('allows a granted account without auditing', async () => {
    const has = jest.fn().mockResolvedValue(true);
    const { guard, audit, acp, context } = setup('cms.audit.view', has);
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(has).toHaveBeenCalledWith(7, 'cms.audit.view');
    expect(audit.record).not.toHaveBeenCalled();
    expect(acp.authorize).toHaveBeenCalledWith(
      expect.objectContaining({ xdr_uid: 7 }),
    );
  });

  it('requires local ACP access in addition to the operation permission', async () => {
    const { guard, acp, context } = setup(
      'cms.audit.view',
      jest.fn().mockResolvedValue(true),
    );
    acp.authorize.mockRejectedValue(
      new ForbiddenException('Website ACP access is required.'),
    );
    await expect(guard.canActivate(context)).rejects.toThrow(
      'Website ACP access is required.',
    );
  });

  it('denies and audits an account without the node', async () => {
    const { guard, audit, context } = setup(
      'cms.audit.view',
      jest.fn().mockResolvedValue(false),
    );
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(audit.record).toHaveBeenCalledWith({
      actorAccountId: 7,
      actorPlayerId: null,
      action: 'authorization.permission.denied',
      targetType: 'xdr_permission',
      targetId: 'cms.audit.view',
      result: 'failure',
      requestId: 'req-1',
      details: null,
    });
  });

  it('fails closed when the permission lookup fails', async () => {
    const { guard, audit, context } = setup(
      'cms.audit.view',
      jest.fn().mockRejectedValue(new TypeError('db down')),
    );
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ details: { errorType: 'TypeError' } }),
    );
  });

  it('still denies when the denial cannot be audited', async () => {
    const { guard, audit, context } = setup(
      'cms.audit.view',
      jest.fn().mockResolvedValue(false),
    );
    audit.record.mockRejectedValue(new Error('audit down'));
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('denies routes without permission metadata', async () => {
    const has = jest.fn();
    const { guard, context } = setup(undefined, has);
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(has).not.toHaveBeenCalled();
  });

  it('denies requests without an authenticated account', async () => {
    const has = jest.fn();
    const { guard, context } = setup('cms.audit.view', has, 0);
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(has).not.toHaveBeenCalled();
  });
});
