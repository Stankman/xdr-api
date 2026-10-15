import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountPermissionGroup } from './entities/account-permission-group.entity';
import { PermissionGroup } from './entities/permission-group.entity';
import {
  DEFAULT_PERMISSION_GROUP,
  XDR_PERMISSION_CATALOG,
} from './permission-nodes';
import {
  PermissionGroupSource,
  assertAcyclicHierarchy,
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
    return resolvePermission(
      await this.sourcesForAccount(accountId, now),
      node,
    );
  }

  /** Resolve the account's current grants against the XDR permission catalog. */
  async grantedNodes(accountId: number, now = new Date()): Promise<string[]> {
    const sources = await this.sourcesForAccount(accountId, now);
    return [...XDR_PERMISSION_CATALOG].filter((node) =>
      resolvePermission(sources, node),
    );
  }

  private async sourcesForAccount(
    accountId: number,
    now: Date,
  ): Promise<PermissionGroupSource[]> {
    const [memberships, defaultGroup] = await Promise.all([
      this.memberships.find({
        where: { accountId },
      }),
      this.groups.find({
        relations: { nodes: true, parents: true },
      }),
    ]);
    const sourceById = new Map<number, PermissionGroupSource>();
    for (const group of defaultGroup) {
      sourceById.set(group.id, {
        name: group.name,
        weight: group.weight,
        nodes: (group.nodes ?? []).map((node) => ({
          node: node.node,
          value: Boolean(node.value),
        })),
        parents: [],
      });
    }
    for (const group of defaultGroup) {
      const source = sourceById.get(group.id);
      if (!source) continue;
      source.parents = (group.parents ?? [])
        .map((parent) => sourceById.get(parent.parentGroupId))
        .filter(
          (parent): parent is PermissionGroupSource => parent !== undefined,
        );
    }
    assertAcyclicHierarchy(sourceById.values());
    const defaultSource =
      defaultGroup.find((group) => group.name === DEFAULT_PERMISSION_GROUP) ??
      null;
    const sources = collectSources(
      memberships
        .filter((membership) => sourceById.has(membership.groupId))
        .flatMap((membership) => {
          const group = sourceById.get(membership.groupId);
          return group ? [{ group, expiresAt: membership.expiresAt }] : [];
        }),
      defaultSource ? (sourceById.get(defaultSource.id) ?? null) : null,
      now,
    );
    return sources;
  }
}
