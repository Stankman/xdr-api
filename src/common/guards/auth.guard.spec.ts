import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenConfigService } from '../../config/token/token-config.service';
import { SessionService } from '../../modules/auth/services/session.service';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  const sessionId = 'f5c87ae0-1e12-4e25-9ae0-3ec8c44182c5';
  const request = { headers: { authorization: 'Bearer access-token' } };
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
  } as ExecutionContext;

  it('checks the current session on each authenticated request', async () => {
    let active = true;
    const jwt = {
      verifyAsync: jest.fn().mockResolvedValue({ uid: 17, sid: sessionId, iss: 'xdr-api' }),
    };
    const sessions = {
      activeSession: jest.fn().mockImplementation(async () =>
        active
          ? { id: sessionId, expiresAt: new Date(Date.now() + 60_000) }
          : null,
      ),
    };
    const guard = new AuthGuard(
      { secret: 'test-secret', issuer: 'xdr-api' } as TokenConfigService,
      jwt as unknown as JwtService,
      sessions as unknown as SessionService,
    );

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request).toMatchObject({ xdr_uid: 17, xdr_session_id: sessionId });

    active = false;
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(sessions.activeSession).toHaveBeenCalledTimes(2);
  });
});
