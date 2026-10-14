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
  const tokenHash = createHash('sha256').update(currentRefreshToken).digest('hex');
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
    const tokenService = { execute: jest.fn().mockResolvedValue('new-access-token') };
    const service = new AuthenticationService(
      dataSource as unknown as DataSource,
      {} as never,
      {} as never,
      tokenService as never,
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
    const { service, sessionRepository, tokenRepository } = dependencies(chain(session));

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
    const { service, sessionRepository } = dependencies(chain(null), consumedToken);

    await expect(
      service.refresh(currentRefreshToken, { ipAddress: null, userAgent: null }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(sessionRepository.update).toHaveBeenCalledWith(
      { id: sessionId, revokedAt: expect.anything() },
      { revokedAt: expect.any(Date) },
    );
  });
});
