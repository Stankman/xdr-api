import { SetMetadata } from "@nestjs/common";

export const PERMISSION_KEY = 'permissions';
export const Permission = (permission : string) => SetMetadata(PERMISSION_KEY, permission);