import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import type { IPaginationMeta } from '../../../common/pagination';
import { AccountSession } from '../entities/account-session.entity';

export const SESSION_ACTIVITY_WRITE_INTERVAL_MS = 5 * 60 * 1000;

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(AccountSession)
    private readonly sessions: Repository<AccountSession>,
  ) {}

  async activeSession(sessionId: string, accountId: number): Promise<AccountSession | null> {
    const now = new Date();
    const session = await this.sessions.findOne({
      where: { id: sessionId, accountId, revokedAt: IsNull() },
    });
    if (!session || session.expiresAt <= now) return null;

    if (now.getTime() - session.lastActivityAt.getTime() >= SESSION_ACTIVITY_WRITE_INTERVAL_MS) {
      await this.sessions
        .createQueryBuilder()
        .update(AccountSession)
        .set({ lastActivityAt: now })
        .where('id = :id AND revoked_at IS NULL AND last_activity_at <= :cutoff', {
          id: session.id,
          cutoff: new Date(now.getTime() - SESSION_ACTIVITY_WRITE_INTERVAL_MS),
        })
        .execute();
      session.lastActivityAt = now;
    }
    return session;
  }

  async revoke(sessionId: string, accountId: number): Promise<boolean> {
    const result = await this.sessions
      .createQueryBuilder()
      .update(AccountSession)
      .set({ revokedAt: new Date() })
      .where('id = :sessionId AND account_id = :accountId AND revoked_at IS NULL', {
        sessionId,
        accountId,
      })
      .execute();
    return (result.affected ?? 0) > 0;
  }

  async revokeAll(accountId: number): Promise<number> {
    const result = await this.sessions
      .createQueryBuilder()
      .update(AccountSession)
      .set({ revokedAt: new Date() })
      .where('account_id = :accountId AND revoked_at IS NULL', { accountId })
      .execute();
    return result.affected ?? 0;
  }

  async listForAccount(
    accountId: number,
    page = 1,
    limit = 50,
  ): Promise<{
    items: AccountSession[];
    meta: IPaginationMeta;
  }> {
    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      page > 100_000 ||
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      throw new BadRequestException('Session pagination is out of range.');
    }
    const [items, totalItems] = await this.sessions.findAndCount({
      where: { accountId },
      select: {
        id: true,
        accountId: true,
        createdAt: true,
        updatedAt: true,
        lastActivityAt: true,
        expiresAt: true,
        revokedAt: true,
        ipAddress: true,
        userAgent: true,
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      items,
      meta: {
        itemCount: items.length,
        totalItems,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }
}
