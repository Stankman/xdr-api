import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { AccountPlayer } from '../entities/account-player.entity';
import { AccountAvatarDto } from '../dtos/account-summary.dto';
import { XdrSetting } from '../../setting/entities/xdr-setting.entity';
import {
  ACCOUNT_MAX_AVATARS_KEY,
  DEFAULT_ACCOUNT_MAX_AVATARS,
  parsePositiveLimit,
} from '../../setting/registration-defaults';

@Injectable()
export class AccountAvatarsService {
  private readonly logger = new Logger(AccountAvatarsService.name);

  constructor(private readonly dataSource: DataSource) {}

  async assertCanAddAvatar(
    manager: EntityManager,
    accountId: number,
  ): Promise<void> {
    const setting = await manager
      .getRepository(XdrSetting)
      .findOne({ where: { key: ACCOUNT_MAX_AVATARS_KEY } });
    const maximum =
      setting === null
        ? DEFAULT_ACCOUNT_MAX_AVATARS
        : parsePositiveLimit(setting.value);
    if (maximum === null) {
      this.invalid('maximum avatars setting');
    }

    const count = await manager
      .getRepository(AccountPlayer)
      .count({ where: { accountId } });
    if (count >= maximum) {
      throw new ConflictException(
        'This account has reached its maximum number of avatars.',
      );
    }
  }

  async forAccount(accountId: number): Promise<AccountAvatarDto[]> {
    const players: unknown = await this.dataSource.query(
      `SELECT p.id, p.name, p.figure, p.motto, p.status,
        DATE_FORMAT(p.created_at, '%Y-%m-%dT%H:%i:%s.%f') AS created_at,
        DATE_FORMAT(p.updated_at, '%Y-%m-%dT%H:%i:%s.%f') AS updated_at,
        DATE_FORMAT(p.last_login, '%Y-%m-%dT%H:%i:%s.%f') AS last_login
       FROM xdr_account_players l LEFT JOIN players p ON p.id = l.player_id
       WHERE l.account_id = ? ORDER BY l.created_at ASC, l.id ASC`,
      [accountId],
    );
    const avatars = this.rows(players).map((row): AccountAvatarDto => {
      const createdAt = this.utcDate(row.created_at);
      const lastLogin =
        row.last_login === null ? null : this.utcDate(row.last_login);
      if (row.status !== 0 && row.status !== 1) this.invalid('player status');
      if (row.motto !== null && typeof row.motto !== 'string')
        this.invalid('player motto');
      return {
        id: this.integer(row.id, 1),
        username: this.text(row.name),
        look: this.text(row.figure),
        motto: row.motto === null ? '' : this.text(row.motto, true),
        online: row.status === 1,
        created_at: createdAt,
        updated_at: this.utcDate(row.updated_at),
        gameLastLoginAt: lastLogin,
        lastLogin: Math.floor(Date.parse(lastLogin ?? createdAt) / 1000),
        credits: 0,
        currencies: [],
      };
    });
    if (!avatars.length) return avatars;

    const byId = new Map(avatars.map((avatar) => [avatar.id, avatar]));
    if (byId.size !== avatars.length) this.invalid('duplicate player link');
    const balances: unknown = await this.dataSource.query(
      `SELECT l.player_id, c.id AS currency_type_id, c.type, c.activity_point_type,
        COALESCE(b.amount, 0) AS amount
       FROM xdr_account_players l
       JOIN players p ON p.id = l.player_id
       CROSS JOIN currency_types c
       LEFT JOIN player_currencies b ON b.player_id = p.id AND b.currency_type_id = c.id
       WHERE l.account_id = ? AND c.enabled = 1
       ORDER BY l.created_at ASC, l.id ASC, c.id ASC`,
      [accountId],
    );
    const kinds = new Map<number, Set<string>>();
    for (const row of this.rows(balances)) {
      const playerId = this.integer(row.player_id, 1);
      const avatar = byId.get(playerId);
      if (!avatar) this.invalid('currency ownership');
      const type = this.integer(row.type, 1);
      const subtype =
        row.activity_point_type === null
          ? null
          : this.integer(row.activity_point_type, 0);
      if (type > 4 || (type !== 4 && subtype !== null))
        this.invalid('currency kind');
      const key = `${type}:${subtype}`;
      const seen = kinds.get(playerId) ?? new Set<string>();
      if (seen.has(key)) this.invalid('ambiguous currency kind');
      seen.add(key);
      kinds.set(playerId, seen);
      const amount = this.integer(row.amount);
      avatar.currencies.push({
        user_id: playerId,
        type,
        currencyTypeId: this.integer(row.currency_type_id, 1),
        activityPointType: subtype,
        amount,
      });
      if (type === 1) avatar.credits = amount;
    }
    for (const avatar of avatars) {
      if (!kinds.get(avatar.id)?.has('1:null'))
        this.invalid('missing enabled credits definition');
    }
    return avatars;
  }

  private rows(value: unknown): Record<string, unknown>[] {
    if (!Array.isArray(value)) this.invalid('query result');
    return value.map((row: unknown) => {
      if (typeof row !== 'object' || row === null || Array.isArray(row)) {
        this.invalid('query row');
      }
      return row as Record<string, unknown>;
    });
  }

  private integer(value: unknown, minimum = -2147483648): number {
    if (
      typeof value !== 'number' ||
      !Number.isSafeInteger(value) ||
      value < minimum ||
      value > 2147483647
    )
      this.invalid('integer field');
    return value;
  }

  private text(value: unknown, allowEmpty = false): string {
    if (typeof value !== 'string' || (!allowEmpty && !value.length))
      this.invalid('text field');
    return value;
  }

  private utcDate(value: unknown): string {
    // DATE_FORMAT bypasses the driver's local-time conversion of MySQL DATETIME.
    if (
      typeof value !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}$/.test(value)
    ) {
      this.invalid('UTC date field');
    }
    const iso = `${value.slice(0, 23)}Z`;
    const date = new Date(iso);
    if (!Number.isFinite(date.getTime()) || date.toISOString() !== iso) {
      this.invalid('UTC date value');
    }
    return iso;
  }

  private invalid(reason: string): never {
    this.logger.error(`Invalid linked-avatar integration data: ${reason}.`);
    throw new InternalServerErrorException(
      'Linked avatar data is inconsistent.',
    );
  }
}
