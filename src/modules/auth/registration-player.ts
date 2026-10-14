import { EntityManager } from 'typeorm';
import { XdrSetting } from '../setting/entities/xdr-setting.entity';
import {
  DEFAULT_REGISTRATION_AVATAR,
  REGISTRATION_AVATAR_MAX_LENGTH,
  REGISTRATION_DEFAULT_AVATAR_KEY,
} from '../setting/registration-defaults';

// Turbo's unique index on players.name (Turbo.Database InitialCreate migration).
export const PLAYER_NAME_INDEX = 'IX_players_name';
export const ACCOUNT_EMAIL_INDEX = 'UQ_xdr_accounts_email';

const PLAYER_GENDER_MALE = 0;
const PLAYER_STATUS_OFFLINE = 0;

export async function resolveRegistrationFigure(
  manager: EntityManager,
): Promise<string> {
  const setting = await manager
    .getRepository(XdrSetting)
    .findOne({ where: { key: REGISTRATION_DEFAULT_AVATAR_KEY } });
  const figure = typeof setting?.value === 'string' ? setting.value.trim() : '';
  return figure && figure.length <= REGISTRATION_AVATAR_MAX_LENGTH
    ? figure
    : DEFAULT_REGISTRATION_AVATAR;
}

/**
 * Inserts a Turbo `players` row the way Turbo's PlayerAccountService does (empty motto, male,
 * offline); every other column keeps its database default.
 */
export async function insertGamePlayer(
  manager: EntityManager,
  player: { name: string; figure: string },
): Promise<number> {
  const result = await manager.query(
    'INSERT INTO `players` (`name`, `motto`, `figure`, `gender`, `status`) VALUES (?, ?, ?, ?, ?)',
    [player.name, '', player.figure, PLAYER_GENDER_MALE, PLAYER_STATUS_OFFLINE],
  );
  const insertId = Number((result as { insertId?: unknown })?.insertId);
  if (!Number.isSafeInteger(insertId) || insertId < 1) {
    throw new Error('The players insert did not return a player id.');
  }
  return insertId;
}

/** The unique index named by a MySQL duplicate-key error, or null for any other error. */
export function duplicateKeyIndex(error: unknown): string | null {
  if (!(error instanceof Error)) return null;
  const driverError = (
    error as Error & {
      driverError?: { code?: string; sqlMessage?: string };
    }
  ).driverError;
  if (driverError?.code !== 'ER_DUP_ENTRY') return null;
  const message = driverError.sqlMessage ?? error.message ?? '';
  const match = /for key '(?:[^'.]+\.)?([^']+)'/.exec(message);
  return match?.[1] ?? '';
}
