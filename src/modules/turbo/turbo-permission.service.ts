import { ForbiddenException, Injectable } from '@nestjs/common';
import { TurboAdminClient } from './turbo-admin.client';

@Injectable()
export class TurboPermissionService {
  constructor(private readonly turbo: TurboAdminClient) {}

  async require(
    token: string,
    playerId: number,
    node: string,
  ): Promise<void> {
    const result = await this.turbo.checkPermission(token, playerId, node);
    if (
      result.node !== node ||
      typeof result.isRegistered !== 'boolean' ||
      typeof result.granted !== 'boolean'
    ) {
      throw new ForbiddenException('Turbo permission validation returned an invalid response.');
    }
    if (!result.isRegistered || !result.granted) {
      throw new ForbiddenException(`Turbo permission '${node}' is unregistered or denied.`);
    }
  }
}
