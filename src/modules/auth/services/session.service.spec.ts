import { Repository } from 'typeorm';
import { AccountSession } from '../entities/account-session.entity';
import { SessionService } from './session.service';

describe('SessionService', () => {
  const sessionId = '9e91b679-c868-4412-8598-6462dc12f495';

  it('throttles last-activity writes to the configured interval', async () => {
    const query = {
      update: jest.fn(),
      set: jest.fn(),
      where: jest.fn(),
      execute: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    query.update.mockReturnValue(query);
    query.set.mockReturnValue(query);
    query.where.mockReturnValue(query);
    const repository = {
      findOne: jest.fn().mockResolvedValue({
        id: sessionId,
        accountId: 21,
        lastActivityAt: new Date(Date.now() - 6 * 60_000),
        expiresAt: new Date(Date.now() + 60_000),
      }),
      createQueryBuilder: jest.fn().mockReturnValue(query),
    };
    const service = new SessionService(repository as unknown as Repository<AccountSession>);

    await service.activeSession(sessionId, 21);

    expect(query.execute).toHaveBeenCalledTimes(1);
    expect(query.where).toHaveBeenCalledWith(
      'id = :id AND revoked_at IS NULL AND last_activity_at <= :cutoff',
      expect.objectContaining({ id: sessionId, cutoff: expect.any(Date) }),
    );
  });

  it('scopes revocation to the owning account', async () => {
    const query = {
      update: jest.fn(),
      set: jest.fn(),
      where: jest.fn(),
      execute: jest.fn().mockResolvedValue({ affected: 0 }),
    };
    query.update.mockReturnValue(query);
    query.set.mockReturnValue(query);
    query.where.mockReturnValue(query);
    const repository = {
      createQueryBuilder: jest.fn().mockReturnValue(query),
    };
    const service = new SessionService(repository as unknown as Repository<AccountSession>);

    await expect(service.revoke(sessionId, 21)).resolves.toBe(false);
    expect(query.where).toHaveBeenCalledWith(
      'id = :sessionId AND account_id = :accountId AND revoked_at IS NULL',
      { sessionId, accountId: 21 },
    );
  });
});
