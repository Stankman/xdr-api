import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountPermissionGroup } from './entities/account-permission-group.entity';
import { PermissionGroup } from './entities/permission-group.entity';
import { DEFAULT_PERMISSION_GROUP } from './permission-nodes';
import {
  PermissionGroupSource,
  collectSources,
  resolvePermission,
} from './permission-resolver';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(AccountPermissionGroup)
    private readonly memberships: Repository<AccountPermissionGroup>,
    @InjectRepository(PermissionGroup)
    private readonly groups: Repository<PermissionGroup>,
  ) {}

  /** Read fresh for every check so revocations apply on the next request. */
  async has(
    accountId: number,
    node: string,
    now = new Date(),
  ): Promise<boolean> {
    const [memberships, defaultGroup] = await Promise.all([
      this.memberships.find({
        where: { accountId },
        relations: { group: { nodes: true } },
      }),
      this.groups.findOne({
        where: { name: DEFAULT_PERMISSION_GROUP },
        relations: { nodes: true },
      }),
    ]);
    const sources = collectSources(
      memberships
        .filter((membership) => membership.group)
        .map((membership) => ({
          group: this.toSource(membership.group as PermissionGroup),
          expiresAt: membership.expiresAt,
        })),
      defaultGroup ? this.toSource(defaultGroup) : null,
      now,
    );
    return resolvePermission(sources, node);
  }

  private toSource(group: PermissionGroup): PermissionGroupSource {
    return {
      name: group.name,
      weight: group.weight,
      nodes: (group.nodes ?? []).map((node) => ({
        node: node.node,
        value: Boolean(node.value),
      })),
    };
  }
}
