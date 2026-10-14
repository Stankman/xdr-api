import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { TokenConfigService } from '../../config/token/token-config.service';
import { SessionService } from '../../modules/auth/services/session.service';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

interface AccessTokenPayload {
  uid: number;
  sid: string;
  iss: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokenConfig: TokenConfigService,
    private readonly jwtService: JwtService,
    private readonly sessions: SessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException();

    let payload: AccessTokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token, {
        secret: this.tokenConfig.secret,
        issuer: this.tokenConfig.issuer,
      });
    } catch {
      throw new UnauthorizedException();
    }

    if (
      !Number.isSafeInteger(payload.uid) ||
      payload.uid < 1 ||
      typeof payload.sid !== 'string' ||
      payload.sid.length !== 36 ||
      payload.iss !== this.tokenConfig.issuer
    ) {
      throw new UnauthorizedException();
    }

    const session = await this.sessions.activeSession(payload.sid, payload.uid);
    if (!session) throw new UnauthorizedException('Website session is inactive or expired.');

    request.xdr_uid = payload.uid;
    request.xdr_session_id = payload.sid;
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const match = /^Bearer ([^\s]+)$/i.exec(request.headers.authorization ?? '');
    return match?.[1];
  }
}
