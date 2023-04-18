import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UnauthorizedException } from '../exceptions/unauthorized.exception';
import { TokenConfigService } from '../../config/token/token-config.service';
import { AppConfigService } from 'src/config/app/app-config.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private readonly appConfig : AppConfigService,
    private readonly tokenConfig : TokenConfigService,
    private readonly jwtService : JwtService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, { secret: this.tokenConfig.secret });
    
      request['xdr_uid'] = payload['uid'];
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
