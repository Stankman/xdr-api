import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuditLogService } from '../audit/audit-log.service';
import { AccountSession } from '../auth/entities/account-session.entity';
import { AuthenticationService } from '../auth/services/authentication.service';

@Injectable()
export class StaffAccountSessionsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly audit: AuditLogService,
    private readonly authentication: AuthenticationService,
  ) {}

  async list(
    targetAccountId: number,
    actorAccountId: number,
    actorPlayerId: number | null,
    requestId: string,
    page: number,
    limit: number,
  ) {
    const sessions = await this.authentication.sessionsForAccount(targetAccountId, page, limit);
    await this.audit.record({
      actorAccountId,
      actorPlayerId,
      action: 'account.sessions.view',
      targetType: 'account',
      targetId: String(targetAccountId),
      result: 'success',
      requestId,
    });
    return sessions;
  }

  async revoke(
    targetAccountId: number,
    sessionId: string,
    actorAccountId: number,
    actorPlayerId: number | null,
    requestId: string,
  ): Promise<{ message: string }> {
    try {
      await this.dataSource.transaction(async (manager) => {
        const result = await manager
          .getRepository(AccountSession)
          .createQueryBuilder()
          .update(AccountSession)
          .set({ revokedAt: new Date() })
          .where(
            'id = :sessionId AND account_id = :targetAccountId AND revoked_at IS NULL',
            { sessionId, targetAccountId },
          )
          .execute();
        if (!result.affected) {
          throw new NotFoundException('Session was not found for this account.');
        }
        await this.audit.record(
          {
            actorAccountId,
            actorPlayerId,
            action: 'account.sessions.revoke',
            targetType: 'account_session',
            targetId: sessionId,
            result: 'success',
            requestId,
          },
          manager,
        );
      });
      return { message: 'Account session revoked.' };
    } catch (error) {
      await this.audit.record({
        actorAccountId,
        actorPlayerId,
        action: 'account.sessions.revoke',
        targetType: 'account_session',
        targetId: sessionId,
        result: 'failure',
        requestId,
        details: { errorType: error instanceof Error ? error.name : 'UnknownError' },
      });
      throw error;
    }
  }
}
