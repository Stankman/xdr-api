import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, randomBytes, randomUUID } from 'crypto';
import { DataSource, IsNull, Repository } from 'typeorm';
import { WebsiteAccountService } from '../../account/services/website-account.service';
import { Account } from '../../account/entities/account.entity';
import { HashService } from '../../shared/services/hash.service';
import { AccountSession } from '../entities/account-session.entity';
import { AccountToken, AccountTokenPurpose } from '../entities/account-token.entity';
import { LoginDto } from '../dtos/login.dto';
import { RegisterAccountDto } from '../dtos/register-account.dto';
import { MailerService } from './mailer.service';
import { SessionService } from './session.service';
import { TokenService } from './token.service';

const REFRESH_TOKEN_LIFETIME_DAYS = 30;
const EMAIL_TOKEN_LIFETIME_HOURS = 24;
const RECOVERY_TOKEN_LIFETIME_MINUTES = 30;
const PASSWORD_MIN_LENGTH = 12;

interface RequestMetadata {
  ipAddress: string | null;
  userAgent: string | null;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
}

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly accounts: WebsiteAccountService,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
    private readonly mailer: MailerService,
  ) {}

  async register(
    input: RegisterAccountDto,
    metadata: RequestMetadata,
  ): Promise<{ message: string }> {
    this.mailer.assertConfigured();
    this.validatePassword(input.password);
    const passwordHash = await this.hashService.hash(input.password);
    const rawToken = this.newToken();
    const now = new Date();

    let account: Account;
    try {
      account = await this.dataSource.transaction(async (manager) => {
        const repository = manager.getRepository(Account);
        const exists = await repository
          .createQueryBuilder('account')
          .where('account.email = :email', { email: input.email.trim().toLowerCase() })
          .getOne();
        if (exists) throw new ConflictException('An account with that email already exists.');

        const created = repository.create({
          email: input.email.trim().toLowerCase(),
          password: passwordHash,
          emailVerified: false,
          emailVerifiedAt: null,
          ip_current: metadata.ipAddress,
          ip_register: metadata.ipAddress,
          lastLogin: null,
        });
        const saved = await repository.save(created);
        await this.createToken(manager.getRepository(AccountToken), {
          accountId: saved.id,
          purpose: AccountTokenPurpose.EMAIL_VERIFICATION,
          token: rawToken,
          expiresAt: this.addHours(now, EMAIL_TOKEN_LIFETIME_HOURS),
        });
        return saved;
      });
    } catch (error) {
      if (this.isDuplicateEmailError(error)) {
        throw new ConflictException('An account with that email already exists.');
      }
      throw error;
    }

    await this.mailer.sendVerification(account.email, rawToken);
    return { message: 'Check your email for a verification link.' };
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    this.mailer.assertConfigured();
    const account = await this.accounts.findByEmail(email);
    if (account && !account.emailVerified) {
      const rawToken = this.newToken();
      const now = new Date();
      await this.dataSource.transaction(async (manager) => {
        await manager.getRepository(AccountToken).update(
          {
            accountId: account.id,
            purpose: AccountTokenPurpose.EMAIL_VERIFICATION,
            consumedAt: IsNull(),
          },
          { consumedAt: now },
        );
        await this.createToken(manager.getRepository(AccountToken), {
          accountId: account.id,
          purpose: AccountTokenPurpose.EMAIL_VERIFICATION,
          token: rawToken,
          expiresAt: this.addHours(now, EMAIL_TOKEN_LIFETIME_HOURS),
        });
      });
      await this.mailer.sendVerification(account.email, rawToken);
    }
    return { message: 'If the account requires verification, an email will be sent.' };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const now = new Date();
    const tokenHash = this.hashToken(token);
    const accountId = await this.dataSource.transaction(async (manager) => {
      const tokens = manager.getRepository(AccountToken);
      const record = await tokens
        .createQueryBuilder('token')
        .setLock('pessimistic_write')
        .where('token.token_hash = :tokenHash', { tokenHash })
        .andWhere('token.purpose = :purpose', {
          purpose: AccountTokenPurpose.EMAIL_VERIFICATION,
        })
        .andWhere('token.consumed_at IS NULL')
        .andWhere('token.expires_at > :now', { now })
        .getOne();
      if (!record) throw new BadRequestException('The verification token is invalid or expired.');

      record.consumedAt = now;
      await tokens.save(record);
      await manager.getRepository(Account).update(record.accountId, {
        emailVerified: true,
        emailVerifiedAt: now,
      });
      return record.accountId;
    });
    if (!accountId) throw new BadRequestException('The verification token is invalid or expired.');
    return { message: 'Email address verified.' };
  }

  async login(input: LoginDto, metadata: RequestMetadata): Promise<AuthTokens> {
    const account = await this.accounts.findByEmail(input.email, true);
    if (!account || !(await this.hashService.verify(account.password, input.password))) {
      throw new UnauthorizedException('Email or password is incorrect.');
    }
    if (!account.emailVerified) {
      throw new ForbiddenException('Verify your email address before signing in.');
    }
    const now = new Date();
    await this.accounts.updateLogin(account.id, metadata.ipAddress, now);
    return this.createSession(account.id, metadata, now);
  }

  async refresh(token: string, metadata: RequestMetadata): Promise<AuthTokens> {
    const oldHash = this.hashToken(token);
    const newToken = this.newToken();
    const now = new Date();
    const outcome = await this.dataSource.transaction(async (manager) => {
      const sessions = manager.getRepository(AccountSession);
      const session = await sessions
        .createQueryBuilder('session')
        .addSelect('session.refreshTokenHash')
        .setLock('pessimistic_write')
        .where('session.refresh_token_hash = :oldHash', { oldHash })
        .getOne();

      if (!session) {
        const tokens = manager.getRepository(AccountToken);
        const previous = await tokens
          .createQueryBuilder('token')
          .setLock('pessimistic_write')
          .where('token.token_hash = :oldHash', { oldHash })
          .andWhere('token.purpose = :purpose', { purpose: AccountTokenPurpose.REFRESH })
          .getOne();
        if (previous?.consumedAt && previous.sessionId) {
          await sessions.update(
            { id: previous.sessionId, revokedAt: IsNull() },
            { revokedAt: now },
          );
          return { kind: 'reuse' as const };
        }
        return { kind: 'invalid' as const };
      }

      if (session.revokedAt || session.expiresAt <= now) {
        return { kind: 'invalid' as const };
      }

      await this.createToken(manager.getRepository(AccountToken), {
        accountId: session.accountId,
        purpose: AccountTokenPurpose.REFRESH,
        token,
        sessionId: session.id,
        expiresAt: session.expiresAt,
        consumedAt: now,
      });

      session.refreshTokenHash = this.hashToken(newToken);
      session.lastActivityAt = now;
      session.expiresAt = this.addDays(now, REFRESH_TOKEN_LIFETIME_DAYS);
      session.ipAddress = metadata.ipAddress;
      session.userAgent = metadata.userAgent;
      const accessToken = await this.tokenService.execute(session.accountId, session.id);
      await sessions.save(session);
      return {
        kind: 'rotated' as const,
        accessToken,
        refreshToken: newToken,
      };
    });

    if (outcome.kind !== 'rotated') {
      throw new UnauthorizedException(
        outcome.kind === 'reuse'
          ? 'Refresh token reuse was detected; this session has been revoked.'
          : 'Refresh token is invalid or expired.',
      );
    }
    return {
      access_token: outcome.accessToken,
      refresh_token: outcome.refreshToken,
      token_type: 'Bearer',
    };
  }

  async logout(sessionId: string, accountId: number): Promise<{ message: string }> {
    await this.sessionService.revoke(sessionId, accountId);
    return { message: 'Session revoked.' };
  }

  async accountSummary(accountId: number): Promise<{
    id: number;
    email: string;
    emailVerified: boolean;
    createdAt: Date;
  }> {
    const account = await this.accounts.findById(accountId);
    if (!account) throw new UnauthorizedException();
    return {
      id: account.id,
      email: account.email,
      emailVerified: account.emailVerified,
      createdAt: account.created_at,
    };
  }

  sessionsForAccount(accountId: number, page = 1, limit = 50) {
    return this.sessionService.listForAccount(accountId, page, limit);
  }

  async revokeOwnedSession(
    accountId: number,
    sessionId: string,
  ): Promise<{ message: string }> {
    if (!(await this.sessionService.revoke(sessionId, accountId))) {
      throw new NotFoundException('Session was not found for this account.');
    }
    return { message: 'Session revoked.' };
  }

  async logoutAll(accountId: number): Promise<{ revoked: number }> {
    return { revoked: await this.sessionService.revokeAll(accountId) };
  }

  async changePassword(
    accountId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    this.validatePassword(newPassword);
    const account = await this.accounts.findById(accountId);
    if (!account) throw new UnauthorizedException();
    const withPassword = await this.accounts.findByEmail(account.email, true);
    if (!withPassword || !(await this.hashService.verify(withPassword.password, currentPassword))) {
      throw new UnauthorizedException('Current password is incorrect.');
    }
    if (await this.hashService.verify(withPassword.password, newPassword)) {
      throw new BadRequestException('The new password must differ from the current password.');
    }
    const passwordHash = await this.hashService.hash(newPassword);
    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Account).update(accountId, { password: passwordHash });
      await manager
        .getRepository(AccountSession)
        .createQueryBuilder()
        .update(AccountSession)
        .set({ revokedAt: new Date() })
        .where('account_id = :accountId AND revoked_at IS NULL', { accountId })
        .execute();
    });
    return { message: 'Password changed. Sign in again on your devices.' };
  }

  async requestPasswordRecovery(email: string): Promise<{ message: string }> {
    this.mailer.assertConfigured();
    const account = await this.accounts.findByEmail(email);
    if (account) {
      const rawToken = this.newToken();
      const now = new Date();
      await this.dataSource.transaction(async (manager) => {
        await manager.getRepository(AccountToken).update(
          {
            accountId: account.id,
            purpose: AccountTokenPurpose.PASSWORD_RECOVERY,
            consumedAt: IsNull(),
          },
          { consumedAt: now },
        );
        await this.createToken(manager.getRepository(AccountToken), {
          accountId: account.id,
          purpose: AccountTokenPurpose.PASSWORD_RECOVERY,
          token: rawToken,
          expiresAt: new Date(now.getTime() + RECOVERY_TOKEN_LIFETIME_MINUTES * 60_000),
        });
      });
      await this.mailer.sendPasswordRecovery(account.email, rawToken);
    }
    return { message: 'If the account exists, a recovery email will be sent.' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    this.validatePassword(newPassword);
    const passwordHash = await this.hashService.hash(newPassword);
    const now = new Date();
    const tokenHash = this.hashToken(token);
    await this.dataSource.transaction(async (manager) => {
      const tokens = manager.getRepository(AccountToken);
      const record = await tokens
        .createQueryBuilder('token')
        .setLock('pessimistic_write')
        .where('token.token_hash = :tokenHash', { tokenHash })
        .andWhere('token.purpose = :purpose', { purpose: AccountTokenPurpose.PASSWORD_RECOVERY })
        .andWhere('token.consumed_at IS NULL')
        .andWhere('token.expires_at > :now', { now })
        .getOne();
      if (!record) throw new BadRequestException('The recovery token is invalid or expired.');

      record.consumedAt = now;
      await tokens.save(record);
      await manager.getRepository(Account).update(record.accountId, { password: passwordHash });
      await manager
        .getRepository(AccountSession)
        .createQueryBuilder()
        .update(AccountSession)
        .set({ revokedAt: now })
        .where('account_id = :accountId AND revoked_at IS NULL', {
          accountId: record.accountId,
        })
        .execute();
    });
    return { message: 'Password reset. Sign in with your new password.' };
  }

  private async createSession(
    accountId: number,
    metadata: RequestMetadata,
    now: Date,
  ): Promise<AuthTokens> {
    const id = randomUUID();
    const refreshToken = this.newToken();
    const expiresAt = this.addDays(now, REFRESH_TOKEN_LIFETIME_DAYS);
    await this.dataSource.getRepository(AccountSession).save(
      this.dataSource.getRepository(AccountSession).create({
        id,
        accountId,
        refreshTokenHash: this.hashToken(refreshToken),
        createdAt: now,
        updatedAt: now,
        lastActivityAt: now,
        expiresAt,
        revokedAt: null,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
      }),
    );
    return {
      access_token: await this.tokenService.execute(accountId, id),
      refresh_token: refreshToken,
      token_type: 'Bearer',
    };
  }

  private async createToken(
    repository: Repository<AccountToken>,
    token: {
      accountId: number;
      purpose: AccountTokenPurpose;
      token: string;
      expiresAt: Date;
      consumedAt?: Date;
      sessionId?: string;
    },
  ): Promise<void> {
    await repository.save(
      repository.create({
        accountId: token.accountId,
        purpose: token.purpose,
        tokenHash: this.hashToken(token.token),
        sessionId: token.sessionId ?? null,
        expiresAt: token.expiresAt,
        consumedAt: token.consumedAt ?? null,
      }),
    );
  }

  private validatePassword(password: string): void {
    if (
      typeof password !== 'string' ||
      password.length < PASSWORD_MIN_LENGTH ||
      password.length > 128
    ) {
      throw new BadRequestException('Password must contain between 12 and 128 characters.');
    }
  }

  private newToken(): string {
    return randomBytes(32).toString('base64url');
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token, 'utf8').digest('hex');
  }

  private addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  }

  private addHours(date: Date, hours: number): Date {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
  }

  private isDuplicateEmailError(error: unknown): boolean {
    if (!(error instanceof Error) || !('driverError' in error)) return false;
    const driverError = (error as Error & { driverError?: { code?: string } }).driverError;
    return driverError?.code === 'ER_DUP_ENTRY';
  }
}
