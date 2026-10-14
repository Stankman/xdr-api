import { SetMetadata } from '@nestjs/common';
import type { XdrPermissionNode } from '../../modules/permission/permission-nodes';

export const XDR_PERMISSION_KEY = 'xdr_permission';
export const RequirePermission = (node: XdrPermissionNode) =>
  SetMetadata(XDR_PERMISSION_KEY, node);
