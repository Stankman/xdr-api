import { Test } from '@nestjs/testing';
import { AuditLogService } from '../audit/audit-log.service';
import { PermissionService } from '../permission/permission.service';
import { AcpAccessService } from './acp-access.service';

describe('AcpAccessService', () => {
  const permissions = { has: jest.fn() };
  const audit = { record: jest.fn() };
  let service: AcpAccessService;

  beforeEach(async () => {
    jest.resetAllMocks();
    permissions.has.mockResolvedValue(true);
    audit.record.mockResolvedValue(undefined);
    const module = await Test.createTestingModule({
      providers: [
        AcpAccessService,
        { provide: PermissionService, useValue: permissions },
        { provide: AuditLogService, useValue: audit },
      ],
    }).compile();
    service = module.get(AcpAccessService);
  });

  it.each([true, false])(
    'returns website eligibility %s from local permissions',
    async (allowed) => {
      permissions.has.mockResolvedValue(allowed);
      await expect(service.eligibility(42)).resolves.toEqual({
        canAccessAcp: allowed,
      });
      expect(permissions.has).toHaveBeenCalledWith(42, 'cms.acp.access');
    },
  );

  it('does not turn a permission lookup error into false eligibility', async () => {
    permissions.has.mockRejectedValue(new Error('database unavailable'));
    await expect(service.eligibility(42)).rejects.toThrow(
      'database unavailable',
    );
  });

  it('requires the local ACP permission and audits denied access', async () => {
    permissions.has.mockResolvedValue(false);
    await expect(
      service.authorize({ xdr_uid: 42, requestId: 'req-1' }),
    ).rejects.toThrow('Website ACP access is required.');
    expect(permissions.has).toHaveBeenCalledWith(42, 'cms.acp.access');
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        actorAccountId: 42,
        action: 'authorization.acp.denied',
        targetType: 'xdr_account',
        targetId: '42',
        result: 'failure',
        requestId: 'req-1',
      }),
    );
  });

  it('allows local ACP access without an external Turbo session', async () => {
    await expect(
      service.authorize({ xdr_uid: 42, requestId: 'req-1' }),
    ).resolves.toBeUndefined();
    expect(audit.record).not.toHaveBeenCalled();
  });
});
