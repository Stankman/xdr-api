import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource, EntityManager } from 'typeorm';
import { XdrSetting } from '../../setting/entities/xdr-setting.entity';
import {
  ACCOUNT_MAX_AVATARS_KEY,
  DEFAULT_ACCOUNT_MAX_AVATARS,
} from '../../setting/registration-defaults';
import { AccountAvatarsService } from './account-avatars.service';

const player = {
  id: 501,
  name: 'player_abcdef',
  figure: 'hr-115-42.hd-195-19',
  motto: null,
  status: 0,
  created_at: '2026-10-14T05:00:00.123456',
  updated_at: '2026-10-14T06:00:00.000000',
  last_login: null,
};
const credits = {
  player_id: 501,
  currency_type_id: 17,
  type: 1,
  activity_point_type: null,
  amount: 123,
};

describe('AccountAvatarsService', () => {
  let service: AccountAvatarsService;
  let query: jest.Mock;

  beforeEach(async () => {
    query = jest
      .fn()
      .mockResolvedValueOnce([player])
      .mockResolvedValueOnce([credits]);
    const module = await Test.createTestingModule({
      providers: [
        AccountAvatarsService,
        { provide: DataSource, useValue: { query } },
      ],
    }).compile();
    service = module.get(AccountAvatarsService);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('projects real profile fields and credits by kind, not definition ID', async () => {
    expect(await service.forAccount(42)).toEqual([
      {
        id: 501,
        username: player.name,
        look: player.figure,
        motto: '',
        online: false,
        created_at: '2026-10-14T05:00:00.123Z',
        updated_at: '2026-10-14T06:00:00.000Z',
        gameLastLoginAt: null,
        lastLogin: Date.parse('2026-10-14T05:00:00Z') / 1000,
        credits: 123,
        currencies: [
          {
            user_id: 501,
            type: 1,
            currencyTypeId: 17,
            activityPointType: null,
            amount: 123,
          },
        ],
      },
    ]);
    for (const [sql, parameters] of query.mock.calls) {
      expect(sql).toContain('l.account_id = ?');
      expect(parameters).toEqual([42]);
      expect(sql).not.toMatch(/\b(INSERT|UPDATE|DELETE)\b/i);
    }
    expect(query.mock.calls[0][0]).toContain('LEFT JOIN players');
    expect(query.mock.calls[0][0]).toContain(
      'ORDER BY l.created_at ASC, l.id ASC',
    );
    expect(query.mock.calls[0][0]).toContain('DATE_FORMAT');
    expect(query.mock.calls[1][0]).toContain('c.enabled = 1');
    expect(query.mock.calls[1][0]).toContain('COALESCE(b.amount, 0)');
    expect(query.mock.calls[1][0]).toContain('LEFT JOIN player_currencies');
  });

  it('retains ordered players and distinct activity-point subtypes without N+1 queries', async () => {
    query
      .mockReset()
      .mockResolvedValueOnce([player, { ...player, id: 502, status: 1 }])
      .mockResolvedValueOnce([
        credits,
        { ...credits, player_id: 502 },
        { ...credits, type: 4, currency_type_id: 18, activity_point_type: 0 },
        { ...credits, type: 4, currency_type_id: 19, activity_point_type: 5 },
      ]);
    const avatars = await service.forAccount(42);
    expect(avatars.map((avatar) => avatar.id)).toEqual([501, 502]);
    expect(avatars[1].online).toBe(true);
    expect(
      avatars[0].currencies.map((currency) => currency.activityPointType),
    ).toEqual([null, 0, 5]);
    expect(query).toHaveBeenCalledTimes(2);
  });

  it('uses the real UTC game login as Unix seconds when present', async () => {
    query
      .mockReset()
      .mockResolvedValueOnce([
        { ...player, last_login: '2026-10-14T07:30:15.999999' },
      ])
      .mockResolvedValueOnce([credits]);
    const [avatar] = await service.forAccount(42);
    expect(avatar.gameLastLoginAt).toBe('2026-10-14T07:30:15.999Z');
    expect(avatar.lastLogin).toBe(Date.parse('2026-10-14T07:30:15Z') / 1000);
  });

  it('accepts zero for an uninitialized balance', async () => {
    query
      .mockReset()
      .mockResolvedValueOnce([player])
      .mockResolvedValueOnce([{ ...credits, amount: 0 }]);
    expect((await service.forAccount(42))[0].credits).toBe(0);
  });

  it('returns no avatars without reading currency tables when there are no links', async () => {
    query.mockReset().mockResolvedValueOnce([]);
    expect(await service.forAccount(42)).toEqual([]);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('allows an avatar below the configured account limit', async () => {
    const setting = { findOne: jest.fn().mockResolvedValue({ value: '3' }) };
    const links = { count: jest.fn().mockResolvedValue(2) };
    const manager = {
      getRepository: jest.fn((entity) =>
        entity === XdrSetting ? setting : links,
      ),
    };
    await expect(
      service.assertCanAddAvatar(manager as unknown as EntityManager, 42),
    ).resolves.toBeUndefined();
    expect(setting.findOne).toHaveBeenCalledWith({
      where: { key: ACCOUNT_MAX_AVATARS_KEY },
    });
    expect(links.count).toHaveBeenCalledWith({ where: { accountId: 42 } });
  });

  it('uses the default avatar limit when no setting row exists', async () => {
    const setting = { findOne: jest.fn().mockResolvedValue(null) };
    const links = {
      count: jest.fn().mockResolvedValue(DEFAULT_ACCOUNT_MAX_AVATARS),
    };
    const manager = {
      getRepository: jest.fn((entity) =>
        entity === XdrSetting ? setting : links,
      ),
    };
    await expect(
      service.assertCanAddAvatar(manager as unknown as EntityManager, 42),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects attempts to exceed the configured avatar limit', async () => {
    const setting = { findOne: jest.fn().mockResolvedValue({ value: '2' }) };
    const links = { count: jest.fn().mockResolvedValue(2) };
    const manager = {
      getRepository: jest.fn((entity) =>
        entity === XdrSetting ? setting : links,
      ),
    };
    await expect(
      service.assertCanAddAvatar(manager as unknown as EntityManager, 42),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('fails explicitly for a malformed avatar limit setting', async () => {
    const setting = { findOne: jest.fn().mockResolvedValue({ value: '0' }) };
    const links = { count: jest.fn() };
    const manager = {
      getRepository: jest.fn((entity) =>
        entity === XdrSetting ? setting : links,
      ),
    };
    await expect(
      service.assertCanAddAvatar(manager as unknown as EntityManager, 42),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
    expect(links.count).not.toHaveBeenCalled();
  });

  it.each([
    { ...player, id: null },
    { ...player, name: '' },
    { ...player, figure: undefined },
    { ...player, motto: 2 },
    { ...player, status: 2 },
    { ...player, created_at: '2026-02-30T00:00:00.000000' },
    { ...player, updated_at: 'invalid' },
    { ...player, last_login: undefined },
    { ...player, last_login: new Date() },
    null,
  ])('rejects dangling or malformed player rows: %j', async (row) => {
    query.mockReset().mockResolvedValueOnce([row]);
    await expect(service.forAccount(42)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
    expect(query).toHaveBeenCalledTimes(1);
    expect(Logger.prototype.error).toHaveBeenCalled();
  });

  it.each(
    [
      [],
      [credits, { ...credits, currency_type_id: 18 }],
      [{ ...credits, player_id: 999 }],
      [{ ...credits, amount: '123' }],
      [{ ...credits, type: 5 }],
      [{ ...credits, activity_point_type: 0 }],
      [{ ...credits, currency_type_id: null }],
      [{ ...credits, amount: 1.5 }],
    ].map((rows) => ({ rows })),
  )(
    'rejects missing/ambiguous or malformed currency data: %j',
    async ({ rows }) => {
      query
        .mockReset()
        .mockResolvedValueOnce([player])
        .mockResolvedValueOnce(rows);
      await expect(service.forAccount(42)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
    },
  );

  it('rejects duplicate player links', async () => {
    query.mockReset().mockResolvedValueOnce([player, player]);
    await expect(service.forAccount(42)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });

  it('rejects a non-array database result', async () => {
    query.mockReset().mockResolvedValueOnce({});
    await expect(service.forAccount(42)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });

  it.each([1, 2])(
    'propagates failure of database query %i instead of hiding it',
    async (step) => {
      const failure = new Error('database unavailable');
      query.mockReset();
      if (step === 2) query.mockResolvedValueOnce([player]);
      query.mockRejectedValueOnce(failure);
      await expect(service.forAccount(42)).rejects.toBe(failure);
    },
  );
});
