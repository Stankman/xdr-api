import 'reflect-metadata';
import { randomUUID } from 'crypto';
import { EntityManager } from 'typeorm';
import dataSource from '../src/providers/database/xdr-data-source';
import { Account } from '../src/modules/account/entities/account.entity';
import { AuditLog } from '../src/modules/audit/entities/audit-log.entity';
import { AccountPermissionGroup } from '../src/modules/permission/entities/account-permission-group.entity';
import { PermissionGroup } from '../src/modules/permission/entities/permission-group.entity';
import { DEFAULT_PERMISSION_GROUP } from '../src/modules/permission/permission-nodes';

/*
 * Assigns XDR permission groups to website accounts. There is no HTTP endpoint for this.
 *   npm run permissions:assign -- --email a@b.c --group admin [--expires 2030-01-01T00:00:00Z]
 *   npm run permissions:remove -- --email a@b.c --group admin
 *   npm run permissions:list -- --email a@b.c
 */

type Command = 'assign' | 'remove' | 'list';

function option(args: string[], name: string): string | undefined {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : undefined;
}

function required(args: string[], name: string): string {
  const value = option(args, name);
  if (!value || value.startsWith('--'))
    throw new Error(`--${name} is required.`);
  return value;
}

async function findAccount(
  manager: EntityManager,
  email: string,
): Promise<Account> {
  const account = await manager.findOne(Account, {
    where: { email: email.trim().toLowerCase() },
  });
  if (!account) throw new Error(`No website account has the email ${email}.`);
  return account;
}

async function findGroup(
  manager: EntityManager,
  name: string,
): Promise<PermissionGroup> {
  const group = await manager.findOne(PermissionGroup, { where: { name } });
  if (!group) throw new Error(`No permission group is named ${name}.`);
  return group;
}

async function audit(
  manager: EntityManager,
  action: string,
  account: Account,
  group: PermissionGroup,
  expiresAt: Date | null,
): Promise<void> {
  await manager.insert(AuditLog, {
    actorAccountId: null,
    actorPlayerId: null,
    action,
    targetType: 'xdr_account',
    targetId: String(account.id),
    result: 'success',
    requestId: `cli:${randomUUID()}`,
    details: {
      group: group.name,
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
      source: 'cli',
    },
  });
}

async function run(command: Command, args: string[]): Promise<void> {
  const email = required(args, 'email');
  if (command === 'list') {
    const account = await findAccount(dataSource.manager, email);
    const memberships = await dataSource.manager.find(AccountPermissionGroup, {
      where: { accountId: account.id },
      relations: { group: true },
      order: { groupId: 'ASC' },
    });
    console.log(`${DEFAULT_PERMISSION_GROUP} (implicit)`);
    for (const membership of memberships) {
      const expiry = membership.expiresAt
        ? ` until ${membership.expiresAt.toISOString()}`
        : '';
      console.log(`${membership.group?.name}${expiry}`);
    }
    return;
  }

  const groupName = required(args, 'group');
  if (groupName === DEFAULT_PERMISSION_GROUP) {
    throw new Error(
      `Every account holds ${DEFAULT_PERMISSION_GROUP} implicitly.`,
    );
  }
  const expiresOption = option(args, 'expires');
  const expiresAt = expiresOption ? new Date(expiresOption) : null;
  if (
    expiresAt &&
    (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date())
  ) {
    throw new Error('--expires must be a future ISO-8601 date.');
  }

  await dataSource.transaction(async (manager) => {
    const account = await findAccount(manager, email);
    const group = await findGroup(manager, groupName);
    if (command === 'assign') {
      await manager.upsert(
        AccountPermissionGroup,
        { accountId: account.id, groupId: group.id, expiresAt },
        ['accountId', 'groupId'],
      );
      await audit(
        manager,
        'permission_group.assign',
        account,
        group,
        expiresAt,
      );
      console.log(`Assigned ${group.name} to account ${account.id}.`);
      return;
    }
    const removed = await manager.delete(AccountPermissionGroup, {
      accountId: account.id,
      groupId: group.id,
    });
    if (!removed.affected) {
      console.log(`Account ${account.id} is not in ${group.name}.`);
      return;
    }
    await audit(manager, 'permission_group.remove', account, group, null);
    console.log(`Removed ${group.name} from account ${account.id}.`);
  });
}

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);
  if (command !== 'assign' && command !== 'remove' && command !== 'list') {
    throw new Error(
      'Usage: permissions <assign|remove|list> --email <email> [--group <name>] [--expires <ISO date>]',
    );
  }
  await dataSource.initialize();
  try {
    await run(command, args);
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
