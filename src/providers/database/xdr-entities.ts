import { Account } from '../../modules/account/entities/account.entity';
import { AccountPlayer } from '../../modules/account/entities/account-player.entity';
import { AccountSession } from '../../modules/auth/entities/account-session.entity';
import { AccountToken } from '../../modules/auth/entities/account-token.entity';
import { Article } from '../../modules/article/entities/article.entity';
import { AuditLog } from '../../modules/audit/entities/audit-log.entity';
import { XdrSetting } from '../../modules/setting/entities/xdr-setting.entity';

export const XdrEntities = [
  Account,
  AccountPlayer,
  AccountSession,
  AccountToken,
  Article,
  AuditLog,
  XdrSetting,
];
