import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  requestId: string;
  xdr_uid: number;
  xdr_session_id: string;
  xdr_refresh_token?: string;
}
