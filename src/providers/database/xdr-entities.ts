import { Account } from '../../modules/account/entities/account.entity';
import { AccountPlayer } from '../../modules/account/entities/account-player.entity';
import { AccountSession } from '../../modules/auth/entities/account-session.entity';
import { AccountToken } from '../../modules/auth/entities/account-token.entity';
import { Article } from '../../modules/article/entities/article.entity';
import { AuditLog } from '../../modules/audit/entities/audit-log.entity';
import { XdrSetting } from '../../modules/setting/entities/xdr-setting.entity';
import { PermissionGroup } from '../../modules/permission/entities/permission-group.entity';
import { PermissionGroupNode } from '../../modules/permission/entities/permission-group-node.entity';
import { AccountPermissionGroup } from '../../modules/permission/entities/account-permission-group.entity';

export const XdrEntities = [
  Account,
  AccountPermissionGroup,
  AccountPlayer,
  AccountSession,
  AccountToken,
  Article,
  AuditLog,
  PermissionGroup,
  PermissionGroupNode,
  XdrSetting,
];
