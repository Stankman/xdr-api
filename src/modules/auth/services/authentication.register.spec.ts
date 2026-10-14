import { ConflictException, ServiceUnavailableException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { DataSource } from 'typeorm';
import { Account } from '../../account/entities/account.entity';
import { AccountPlayer } from '../../account/entities/account-player.entity';
import { XdrSetting } from '../../setting/entities/xdr-setting.entity';
import { DEFAULT_REGISTRATION_AVATAR } from '../../setting/registration-defaults';
import {
  AccountToken,
  AccountTokenPurpose,
} from '../entities/account-token.entity';
import { AuthenticationService } from './authentication.service';

function duplicate(index: string): QueryFailedError {
  const driverError = Object.assign(new Error('dup'), {
    code: 'ER_DUP_ENTRY',
    sqlMessage: `Duplicate entry 'x' for key '${index}'`,
  });
  return new QueryFailedError('INSERT', [], driverError);
}

interface Committed {
  accounts: unknown[];
  players: unknown[][];
  links: unknown[];
  tokens: unknown[];
}

/**
 * A fake transactional database: writes go to a per-transaction scratch area and are only
 * copied into `committed` when the callback resolves, as a real rollback would behave.
 */
function harness(options: {
  existing?: Account | null;
  avatarSetting?: string | null;
  playerInsert?: (attempt: number) => unknown;
  linkSave?: () => unknown;
  tokenSave?: () => unknown;
  accountSave?: () => unknown;
}) {
  const committed: Committed = {
    accounts: [],
    players: [],
    links: [],
    tokens: [],
  };
  let playerAttempts = 0;

  const dataSource = {
    transaction: jest.fn(
      async (callback: (manager: unknown) => Promise<unknown>) => {
        const scratch: Committed = {
          accounts: [],
          players: [],
          links: [],
          tokens: [],
        };
        const repositories = new Map<unknown, unknown>([
          [
            Account,
            {
              createQueryBuilder: () => ({
                where: () => ({ getOne: async () => options.existing ?? null }),
              }),
              create: (input: object) => input,
              save: async (input: object) => {
                const failure = options.accountSave?.();
                if (failure) throw failure;
                const saved = { id: 77, ...input };
                scratch.accounts.push(saved);
                return saved;
              },
            },
          ],
          [
            AccountPlayer,
            {
              create: (input: object) => input,
              save: async (input: object) => {
                const failure = options.linkSave?.();
                if (failure) throw failure;
                scratch.links.push(input);
                return input;
              },
            },
          ],
          [
            AccountToken,
            {
              create: (input: object) => input,
              save: async (input: object) => {
                const failure = options.tokenSave?.();
                if (failure) throw failure;
                scratch.tokens.push(input);
                return input;
              },
            },
          ],
          [
            XdrSetting,
            {
              findOne: async () =>
                options.avatarSetting === undefined ||
                options.avatarSetting === null
                  ? null
                  : {
                      key: 'registration.default_avatar',
                      value: options.avatarSetting,
                    },
            },
          ],
        ]);
        const manager = {
          getRepository: (entity: unknown) => repositories.get(entity),
          query: async (_sql: string, parameters: unknown[]) => {
            playerAttempts++;
            const outcome = options.playerInsert?.(playerAttempts);
            if (outcome instanceof Error) throw outcome;
            scratch.players.push(parameters);
            return { insertId: 500 + playerAttempts };
          },
        };
        const result = await callback(manager);
        committed.accounts.push(...scratch.accounts);
        committed.players.push(...scratch.players);
        committed.links.push(...scratch.links);
        committed.tokens.push(...scratch.tokens);
        return result;
      },
    ),
  };
  const mailer = { assertConfigured: jest.fn(), sendVerification: jest.fn() };
  const hashService = { hash: jest.fn().mockResolvedValue('password-hash') };
  const service = new AuthenticationService(
    dataSource as unknown as DataSource,
    {} as never,
    hashService as never,
    {} as never,
    {} as never,
    mailer as never,
  );
  return {
    service,
    committed,
    dataSource,
    mailer,
    attempts: () => playerAttempts,
  };
}

const metadata = { ipAddress: '127.0.0.1', userAgent: 'jest' };
const input = { email: ' Player.One@Example.com ', password: 'secret123' };

describe('AuthenticationService.register', () => {
  it('creates the account, one player, the link and the verification token together', async () => {
    const { service, committed, mailer } = harness({
      avatarSetting: '  hd-180-1  ',
    });

    await expect(service.register(input, metadata)).resolves.toEqual({
      message: 'Check your email for a verification link.',
    });

    expect(committed.accounts).toEqual([
      expect.objectContaining({
        id: 77,
        email: 'player.one@example.com',
        emailVerified: false,
      }),
    ]);
    expect(committed.players).toHaveLength(1);
    const [name, motto, figure, gender, status] = committed
      .players[0] as unknown[];
    expect(name).toMatch(/^playeron_[0-9a-f]{6}$/);
    expect(motto).toBe('');
    expect(figure).toBe('hd-180-1');
    expect(gender).toBe(0);
    expect(status).toBe(0);
    expect(committed.links).toEqual([{ accountId: 77, playerId: 501 }]);
    expect(committed.tokens).toEqual([
      expect.objectContaining({
        accountId: 77,
        purpose: AccountTokenPurpose.EMAIL_VERIFICATION,
      }),
    ]);
    expect(mailer.sendVerification).toHaveBeenCalledWith(
      'player.one@example.com',
      expect.any(String),
    );
  });

  it.each([
    ['missing', null],
    ['blank', '   '],
    ['too long', 'x'.repeat(280)],
  ])(
    'falls back to the built-in figure when the setting is %s',
    async (_label, value) => {
      const { service, committed } = harness({ avatarSetting: value });

      await service.register(input, metadata);

      expect((committed.players[0] as unknown[])[2]).toBe(
        DEFAULT_REGISTRATION_AVATAR,
      );
    },
  );

  it('rejects an existing email without creating a player', async () => {
    const { service, committed, mailer } = harness({
      existing: { id: 1 } as Account,
    });

    await expect(service.register(input, metadata)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(committed.players).toHaveLength(0);
    expect(committed.accounts).toHaveLength(0);
    expect(mailer.sendVerification).not.toHaveBeenCalled();
  });

  it('maps a concurrent duplicate email to a conflict and keeps no player', async () => {
    const { service, committed } = harness({
      accountSave: () => duplicate('xdr_accounts.UQ_xdr_accounts_email'),
    });

    await expect(service.register(input, metadata)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(committed.players).toHaveLength(0);
  });

  it('retries the whole registration with a new name when the player name is taken', async () => {
    const { service, committed, dataSource } = harness({
      playerInsert: (attempt) =>
        attempt === 1 ? duplicate('players.IX_players_name') : undefined,
    });

    await service.register(input, metadata);

    expect(dataSource.transaction).toHaveBeenCalledTimes(2);
    expect(committed.accounts).toHaveLength(1);
    expect(committed.players).toHaveLength(1);
    expect(committed.links).toEqual([{ accountId: 77, playerId: 502 }]);
  });

  it('gives up after repeated player-name collisions without leaving rows behind', async () => {
    const { service, committed, attempts, mailer } = harness({
      playerInsert: () => duplicate('players.IX_players_name'),
    });

    await expect(service.register(input, metadata)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(attempts()).toBe(5);
    expect(committed).toEqual({
      accounts: [],
      players: [],
      links: [],
      tokens: [],
    });
    expect(mailer.sendVerification).not.toHaveBeenCalled();
  });

  it('does not report an unrelated duplicate key as an email conflict', async () => {
    const { service, committed } = harness({
      linkSave: () =>
        duplicate('xdr_account_players.UQ_xdr_account_players_player'),
    });

    await expect(service.register(input, metadata)).rejects.toBeInstanceOf(
      QueryFailedError,
    );
    expect(committed).toEqual({
      accounts: [],
      players: [],
      links: [],
      tokens: [],
    });
  });

  it('rolls back the account and player when the token cannot be stored', async () => {
    const { service, committed, mailer } = harness({
      tokenSave: () => new Error('db down'),
    });

    await expect(service.register(input, metadata)).rejects.toThrow('db down');
    expect(committed).toEqual({
      accounts: [],
      players: [],
      links: [],
      tokens: [],
    });
    expect(mailer.sendVerification).not.toHaveBeenCalled();
  });
});
