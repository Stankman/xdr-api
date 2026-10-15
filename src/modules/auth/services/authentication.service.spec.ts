import { UnauthorizedException } from '@nestjs/common';
import { createHash } from 'crypto';
import { DataSource } from 'typeorm';
import { AccountSession } from '../entities/account-session.entity';
import { AccountTokenPurpose } from '../entities/account-token.entity';
import { AuthenticationService } from './authentication.service';

function chain(result: unknown) {
  const builder = {
    addSelect: jest.fn(),
    setLock: jest.fn(),
    where: jest.fn(),
    andWhere: jest.fn(),
    getOne: jest.fn().mockResolvedValue(result),
  };
  builder.addSelect.mockReturnValue(builder);
  builder.setLock.mockReturnValue(builder);
  builder.where.mockReturnValue(builder);
  builder.andWhere.mockReturnValue(builder);
  return builder;
}

describe('AuthenticationService refresh rotation', () => {
  const currentRefreshToken = 'old-refresh-token';
  const tokenHash = createHash('sha256')
    .update(currentRefreshToken)
    .digest('hex');
  const sessionId = '8e6c2d81-2936-44c2-90ad-c2479cb72126';

  function dependencies(
    sessionLookup: ReturnType<typeof chain>,
    tokenLookup?: ReturnType<typeof chain>,
  ) {
    const sessionRepository = {
      createQueryBuilder: jest.fn(() => sessionLookup),
      save: jest.fn(),
      update: jest.fn(),
    };
    const tokenRepository = {
      createQueryBuilder: jest.fn(() => tokenLookup),
      create: jest.fn((input) => input),
      save: jest.fn(),
    };
    const manager = {
      getRepository: jest.fn((entity) =>
        entity === AccountSession ? sessionRepository : tokenRepository,
      ),
    };
    const dataSource = {
      transaction: jest.fn((callback) => callback(manager)),
    };
    const tokenService = {
      execute: jest.fn().mockResolvedValue('new-access-token'),
    };
    const service = new AuthenticationService(
      dataSource as unknown as DataSource,
      {} as never,
      {} as never,
      tokenService as never,
      {} as never,
      {} as never,
      {} as never,
    );
    return { service, dataSource, sessionRepository, tokenRepository };
  }

  it('replaces the refresh hash and remembers the consumed token hash', async () => {
    const session = {
      id: sessionId,
      accountId: 42,
      refreshTokenHash: tokenHash,
      expiresAt: new Date(Date.now() + 86_400_000),
      lastActivityAt: new Date(),
      ipAddress: null,
      userAgent: null,
      revokedAt: null,
    };
    const { service, sessionRepository, tokenRepository } = dependencies(
      chain(session),
    );

    const result = await service.refresh(currentRefreshToken, {
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent',
    });

    expect(result.access_token).toBe('new-access-token');
    expect(result.refresh_token).not.toBe(currentRefreshToken);
    const savedSession = sessionRepository.save.mock.calls[0][0];
    expect(savedSession).toEqual(expect.objectContaining({ id: sessionId }));
    expect(savedSession.refreshTokenHash).not.toBe(tokenHash);
    expect(tokenRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tokenHash,
        purpose: AccountTokenPurpose.REFRESH,
        sessionId,
        consumedAt: expect.any(Date),
      }),
    );
  });

  it('revokes a session when a consumed refresh token is replayed', async () => {
    const consumedToken = chain({
      consumedAt: new Date(),
      sessionId,
    });
    const { service, sessionRepository } = dependencies(
      chain(null),
      consumedToken,
    );

    await expect(
      service.refresh(currentRefreshToken, {
        ipAddress: null,
        userAgent: null,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(sessionRepository.update).toHaveBeenCalledWith(
      { id: sessionId, revokedAt: expect.anything() },
      { revokedAt: expect.any(Date) },
    );
  });
});

describe('AuthenticationService logout', () => {
  function dependencies(affected = 2) {
    const sessionUpdate = {
      update: jest.fn(),
      set: jest.fn(),
      where: jest.fn(),
      execute: jest.fn().mockResolvedValue({ affected }),
    };
    sessionUpdate.update.mockReturnValue(sessionUpdate);
    sessionUpdate.set.mockReturnValue(sessionUpdate);
    sessionUpdate.where.mockReturnValue(sessionUpdate);
    const sessionRepository = {
      createQueryBuilder: jest.fn(() => sessionUpdate),
    };
    const manager = {
      getRepository: jest.fn(() => sessionRepository),
      query: jest.fn().mockResolvedValue({ affectedRows: 1 }),
    };
    const dataSource = {
      transaction: jest.fn((callback) => callback(manager)),
    };
    const service = new AuthenticationService(
      dataSource as unknown as DataSource,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
    return { service, dataSource, manager, sessionUpdate };
  }

  it('revokes the current website session and terminates linked player sessions', async () => {
    const { service, dataSource, manager, sessionUpdate } = dependencies();

    await expect(service.logout('session-id', 42)).resolves.toEqual({
      message: 'Session revoked.',
    });

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(sessionUpdate.where).toHaveBeenCalledWith(
      'id = :sessionId AND account_id = :accountId AND revoked_at IS NULL',
      { sessionId: 'session-id', accountId: 42 },
    );
    expect(manager.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE players AS p'),
      [42],
    );
    expect(manager.query.mock.calls[0][0]).toContain(
      "SET p.auth_ticket = '', p.status = 0",
    );
  });

  it('revokes every website session and terminates linked player sessions', async () => {
    const { service, manager, sessionUpdate } = dependencies(3);

    await expect(service.logoutAll(42)).resolves.toEqual({ revoked: 3 });

    expect(sessionUpdate.where).toHaveBeenCalledWith(
      'account_id = :accountId AND revoked_at IS NULL',
      { accountId: 42 },
    );
    expect(manager.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE players AS p'),
      [42],
    );
  });
});
