export const REGISTRATION_DEFAULT_AVATAR_KEY = 'registration.default_avatar';
export const DEFAULT_REGISTRATION_AVATAR =
  'hr-115-42.hd-195-19.ch-3030-82.lg-275-1408.fa-1201.ca-1804-64';
export const REGISTRATION_AVATAR_MAX_LENGTH = 279;
export const REGISTRATION_MAX_ACCOUNTS_PER_IP_KEY =
  'registration.max_accounts_per_ip';
export const DEFAULT_REGISTRATION_MAX_ACCOUNTS_PER_IP = 5;
export const ACCOUNT_MAX_AVATARS_KEY = 'account.max_avatars';
export const DEFAULT_ACCOUNT_MAX_AVATARS = 5;
export const REGISTRATION_LIMIT_MAX_VALUE = 2_147_483_647;

export function parsePositiveLimit(value: string | undefined): number | null {
  if (!value || !/^[1-9]\d*$/.test(value)) return null;
  const limit = Number(value);
  return Number.isSafeInteger(limit) && limit <= REGISTRATION_LIMIT_MAX_VALUE
    ? limit
    : null;
}
