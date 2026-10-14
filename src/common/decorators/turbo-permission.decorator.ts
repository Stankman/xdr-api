import { SetMetadata } from '@nestjs/common';

export const TURBO_PERMISSION_KEY = 'xdr_turbo_permission';
export const RequireTurboPermission = (node: string) => SetMetadata(TURBO_PERMISSION_KEY, node);
