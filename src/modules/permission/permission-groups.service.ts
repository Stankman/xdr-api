import {
  BadRequestException,
  InternalServerErrorException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IPaginationMeta } from '../../common/pagination';
import { AuditLogService } from '../audit/audit-log.service';
import { AccountPermissionGroup } from './entities/account-permission-group.entity';
import { PermissionGroup } from './entities/permission-group.entity';

const MAX_PAGE = 100_000;
const MAX_PAGE_SIZE = 100;

@Injectable()
export class PermissionGroupsService {
  constructor(
    @InjectRepository(PermissionGroup)
    private readonly groups: Repository<PermissionGroup>,
    @InjectRepository(AccountPermissionGroup)
    private readonly memberships: Repository<AccountPermissionGroup>,
    private readonly audit: AuditLogService,
  ) {}

  async listGroups(
    actorAccountId: number,
    requestId: string,
    now = new Date(),
  ) {
    const [groups, counts] = await Promise.all([
      this.groups.find({
        relations: { parents: true },
        order: { weight: 'DESC', name: 'ASC' },
      }),
      this.memberships
        .createQueryBuilder('membership')
        .select('membership.groupId', 'groupId')
        .addSelect('COUNT(*)', 'memberCount')
        .where(
          '(membership.expiresAt IS NULL OR membership.expiresAt > :now)',
          { now },
        )
        .groupBy('membership.groupId')
        .getRawMany<{
          groupId: number | string;
          memberCount: number | string;
        }>(),
    ]);
    const names = new Map(groups.map((group) => [group.id, group.name]));
    const memberCounts = new Map(
      counts.map((row) => [Number(row.groupId), Number(row.memberCount)]),
    );
    const result = groups.map((group) => ({
      id: group.id,
      name: group.name,
      displayName: group.displayName,
      weight: group.weight,
      parents: (group.parents ?? [])
        .map((parent) => ({
          id: parent.parentGroupId,
          name: names.get(parent.parentGroupId),
        }))
        .filter(
          (parent): parent is { id: number; name: string } =>
            parent.name !== undefined,
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
      activeDirectMemberCount: memberCounts.get(group.id) ?? 0,
    }));
    await this.audit.record({
      actorAccountId,
      actorPlayerId: null,
      action: 'permission.groups.view',
      targetType: 'xdr_permission_group',
      targetId: null,
      result: 'success',
      requestId,
    });
    return result;
  }

  async listDirectMembers(
    groupId: number,
    actorAccountId: number,
    requestId: string,
    page: number,
    limit: number,
    now = new Date(),
  ) {
    this.validatePagination(page, limit);
    if (!(await this.groups.existsBy({ id: groupId }))) {
      throw new NotFoundException(`Permission group ${groupId} was not found.`);
    }

    const [memberships, totalItems] = await this.memberships
      .createQueryBuilder('membership')
      .innerJoin('membership.account', 'account')
      .select([
        'membership.id',
        'membership.createdAt',
        'membership.expiresAt',
        'account.id',
        'account.email',
        'account.emailVerified',
      ])
      .where('membership.groupId = :groupId', { groupId })
      .andWhere(
        '(membership.expiresAt IS NULL OR membership.expiresAt > :now)',
        { now },
      )
      .orderBy('membership.createdAt', 'DESC')
      .addOrderBy('account.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const items = memberships.map((membership) => {
      if (!membership.account) {
        throw new InternalServerErrorException(
          'A permission group membership has no account.',
        );
      }
      return {
        account: {
          id: membership.account.id,
          email: membership.account.email,
          emailVerified: Boolean(membership.account.emailVerified),
        },
        membership: {
          createdAt: membership.createdAt,
          expiresAt: membership.expiresAt,
        },
      };
    });
    const meta: IPaginationMeta = {
      itemCount: items.length,
      totalItems,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };
    await this.audit.record({
      actorAccountId,
      actorPlayerId: null,
      action: 'permission.group.members.view',
      targetType: 'xdr_permission_group',
      targetId: String(groupId),
      result: 'success',
      requestId,
    });
    return { items, meta };
  }

  private validatePagination(page: number, limit: number): void {
    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      page > MAX_PAGE ||
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      limit > MAX_PAGE_SIZE
    ) {
      throw new BadRequestException(
        'Permission group pagination is out of range.',
      );
    }
  }
}
