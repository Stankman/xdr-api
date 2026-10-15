import { Repository } from 'typeorm';
import { AccountPermissionGroup } from './entities/account-permission-group.entity';
import { PermissionGroup } from './entities/permission-group.entity';
import { PermissionGroupsService } from './permission-groups.service';

describe('PermissionGroupsService', () => {
  it('lists groups with parent summaries and counts only active direct members', async () => {
    const groups = {
      find: jest.fn().mockResolvedValue([
        {
          id: 2,
          name: 'admin',
          displayName: 'Administrator',
          weight: 100,
          parents: [{ parentGroupId: 3 }],
        },
        {
          id: 3,
          name: 'content_editor',
          displayName: 'Content Editor',
          weight: 50,
          parents: [],
        },
      ]),
    };
    const builder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        { groupId: '2', memberCount: '4' },
        { groupId: '3', memberCount: '1' },
      ]),
    };
    const memberships = {
      createQueryBuilder: jest.fn().mockReturnValue(builder),
    };
    const audit = { record: jest.fn().mockResolvedValue(undefined) };
    const service = new PermissionGroupsService(
      groups as unknown as Repository<PermissionGroup>,
      memberships as unknown as Repository<AccountPermissionGroup>,
      audit as never,
    );

    await expect(service.listGroups(42, 'request-id')).resolves.toEqual([
      {
        id: 2,
        name: 'admin',
        displayName: 'Administrator',
        weight: 100,
        parents: [{ id: 3, name: 'content_editor' }],
        activeDirectMemberCount: 4,
      },
      {
        id: 3,
        name: 'content_editor',
        displayName: 'Content Editor',
        weight: 50,
        parents: [],
        activeDirectMemberCount: 1,
      },
    ]);
    expect(builder.where).toHaveBeenCalledWith(
      '(membership.expiresAt IS NULL OR membership.expiresAt > :now)',
      expect.objectContaining({ now: expect.any(Date) }),
    );
    expect(audit.record).toHaveBeenCalledWith({
      actorAccountId: 42,
      actorPlayerId: null,
      action: 'permission.groups.view',
      targetType: 'xdr_permission_group',
      targetId: null,
      result: 'success',
      requestId: 'request-id',
    });
  });

  it('returns only safe account and active direct membership fields', async () => {
    const builder = {
      innerJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([
        [
          {
            account: {
              id: 42,
              email: 'member@example.com',
              emailVerified: true,
              password: 'never return this',
            },
            createdAt: new Date('2030-01-01T00:00:00Z'),
            expiresAt: null,
          },
        ],
        1,
      ]),
    };
    const groups = {
      existsBy: jest.fn().mockResolvedValue(true),
    };
    const memberships = {
      createQueryBuilder: jest.fn().mockReturnValue(builder),
    };
    const audit = { record: jest.fn().mockResolvedValue(undefined) };
    const service = new PermissionGroupsService(
      groups as unknown as Repository<PermissionGroup>,
      memberships as unknown as Repository<AccountPermissionGroup>,
      audit as never,
    );

    const result = await service.listDirectMembers(7, 42, 'request-id', 1, 50);
    expect(result).toEqual({
      items: [
        {
          account: {
            id: 42,
            email: 'member@example.com',
            emailVerified: true,
          },
          membership: {
            createdAt: new Date('2030-01-01T00:00:00Z'),
            expiresAt: null,
          },
        },
      ],
      meta: {
        itemCount: 1,
        totalItems: 1,
        itemsPerPage: 50,
        totalPages: 1,
        currentPage: 1,
      },
    });
    expect(builder.select).toHaveBeenCalledWith([
      'membership.id',
      'membership.createdAt',
      'membership.expiresAt',
      'account.id',
      'account.email',
      'account.emailVerified',
    ]);
    expect(builder.where).toHaveBeenCalledWith(
      'membership.groupId = :groupId',
      { groupId: 7 },
    );
    expect(builder.andWhere).toHaveBeenCalledWith(
      '(membership.expiresAt IS NULL OR membership.expiresAt > :now)',
      expect.objectContaining({ now: expect.any(Date) }),
    );
    expect(builder.skip).toHaveBeenCalledWith(0);
    expect(builder.take).toHaveBeenCalledWith(50);
    expect(audit.record).toHaveBeenCalledWith({
      actorAccountId: 42,
      actorPlayerId: null,
      action: 'permission.group.members.view',
      targetType: 'xdr_permission_group',
      targetId: '7',
      result: 'success',
      requestId: 'request-id',
    });
    expect(JSON.stringify(result)).not.toContain('never return this');
  });

  it('rejects out-of-range page sizes and unknown groups', async () => {
    const groups = {
      existsBy: jest.fn().mockResolvedValue(false),
    };
    const memberships = { createQueryBuilder: jest.fn() };
    const audit = { record: jest.fn() };
    const service = new PermissionGroupsService(
      groups as unknown as Repository<PermissionGroup>,
      memberships as unknown as Repository<AccountPermissionGroup>,
      audit as never,
    );

    await expect(
      service.listDirectMembers(7, 42, 'request-id', 1, 101),
    ).rejects.toThrow('Permission group pagination is out of range.');
    await expect(
      service.listDirectMembers(7, 42, 'request-id', 1, 50),
    ).rejects.toMatchObject({
      status: 404,
    });
  });
});
