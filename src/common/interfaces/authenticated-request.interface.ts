import { Request } from 'express';
import type { TurboAdminMe } from '../../modules/turbo/turbo.contracts';

export interface AuthenticatedRequest extends Request {
  requestId: string;
  xdr_uid: number;
  xdr_session_id: string;
  xdr_refresh_token?: string;
  turbo_admin_token?: string;
  turbo_admin_player_id?: number;
  turbo_admin_identity?: TurboAdminMe;
}
