import { Repository } from 'typeorm';
import { AccountPermissionGroup } from './entities/account-permission-group.entity';
import { PermissionGroup } from './entities/permission-group.entity';
import { PermissionService } from './permission.service';

describe('PermissionService', () => {
  it('returns only effective grants from the XDR permission catalog', async () => {
    const memberships = {
      find: jest
        .fn()
        .mockResolvedValue([{ accountId: 42, groupId: 2, expiresAt: null }]),
    };
    const groups = {
      find: jest.fn().mockResolvedValue([
        {
          id: 1,
          name: 'default',
          weight: 0,
          nodes: [],
          parents: [],
        },
        {
          id: 2,
          name: 'admin',
          weight: 100,
          nodes: [
            { node: 'cms.*', value: true },
            { node: 'cms.settings.manage', value: false },
            { node: 'not.in.catalog', value: true },
          ],
          parents: [],
        },
      ]),
    };
    const service = new PermissionService(
      memberships as unknown as Repository<AccountPermissionGroup>,
      groups as unknown as Repository<PermissionGroup>,
    );

    await expect(service.grantedNodes(42)).resolves.toEqual([
      'cms.acp.access',
      'cms.articles.manage',
      'cms.audit.view',
      'cms.accounts.sessions.view',
      'cms.accounts.sessions.manage',
      'cms.permissions.manage',
    ]);
    expect(memberships.find).toHaveBeenCalledTimes(1);
    expect(groups.find).toHaveBeenCalledTimes(1);
  });

  it.each(['cms.articles.manage', 'cms.acp.access'])(
    'loads parent assignments and grants inherited %s only for active memberships',
    async (node) => {
      const memberships = {
        find: jest
          .fn()
          .mockResolvedValue([{ accountId: 42, groupId: 2, expiresAt: null }]),
      };
      const groups = {
        find: jest.fn().mockResolvedValue([
          {
            id: 1,
            name: 'default',
            weight: 0,
            nodes: [],
            parents: [],
          },
          {
            id: 2,
            name: 'admin',
            weight: 100,
            nodes: [{ node: 'cms.audit.view', value: true }],
            parents: [{ parentGroupId: 3 }],
          },
          {
            id: 3,
            name: 'content_editor',
            weight: 50,
            nodes: [
              { node: 'cms.articles.manage', value: true },
              { node: 'cms.acp.access', value: true },
            ],
            parents: [],
          },
        ]),
      };
      const service = new PermissionService(
        memberships as unknown as Repository<AccountPermissionGroup>,
        groups as unknown as Repository<PermissionGroup>,
      );

      await expect(service.has(42, node)).resolves.toBe(true);
      expect(groups.find).toHaveBeenCalledWith({
        relations: { nodes: true, parents: true },
      });
      memberships.find.mockResolvedValueOnce([
        {
          accountId: 42,
          groupId: 2,
          expiresAt: new Date('2000-01-01T00:00:00Z'),
        },
      ]);
      await expect(service.has(42, node)).resolves.toBe(false);
    },
  );

  it('denies by error rather than resolving through corrupt cyclic hierarchy', async () => {
    const memberships = {
      find: jest.fn().mockResolvedValue([]),
    };
    const groups = {
      find: jest.fn().mockResolvedValue([
        {
          id: 2,
          name: 'first',
          weight: 10,
          nodes: [{ node: '*', value: true }],
          parents: [{ parentGroupId: 3 }],
        },
        {
          id: 3,
          name: 'second',
          weight: 5,
          nodes: [],
          parents: [{ parentGroupId: 2 }],
        },
      ]),
    };
    const service = new PermissionService(
      memberships as unknown as Repository<AccountPermissionGroup>,
      groups as unknown as Repository<PermissionGroup>,
    );

    await expect(service.has(42, 'cms.audit.view')).rejects.toThrow(
      'Permission group inheritance cycle detected',
    );
  });
});
