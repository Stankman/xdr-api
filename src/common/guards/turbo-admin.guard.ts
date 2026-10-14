import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { TurboAdminClient } from '../../modules/turbo/turbo-admin.client';

@Injectable()
export class TurboAdminGuard implements CanActivate {
  constructor(private readonly turbo: TurboAdminClient) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.headers['x-turbo-admin-token'];
    if (typeof token !== 'string' || token.trim().length < 16 || token.length > 512) {
      throw new UnauthorizedException('A separate Turbo Admin session token is required.');
    }

    const identity = await this.turbo.getMe(token.trim());
    if (!Number.isSafeInteger(identity.id) || identity.id < 1 || !identity.name) {
      throw new UnauthorizedException('Turbo Admin returned an invalid session identity.');
    }
    request.turbo_admin_token = token.trim();
    request.turbo_admin_player_id = identity.id;
    request.turbo_admin_identity = identity;
    return true;
  }
}
