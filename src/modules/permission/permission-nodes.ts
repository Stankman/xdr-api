/** Every node an XDR permission check may ask about. Nothing here is granted by default. */
export const XdrPermissionNodes = {
  ARTICLES_MANAGE: 'cms.articles.manage',
  SETTINGS_MANAGE: 'cms.settings.manage',
  AUDIT_VIEW: 'cms.audit.view',
  ACCOUNT_SESSIONS_VIEW: 'cms.accounts.sessions.view',
  ACCOUNT_SESSIONS_MANAGE: 'cms.accounts.sessions.manage',
} as const;

export type XdrPermissionNode =
  (typeof XdrPermissionNodes)[keyof typeof XdrPermissionNodes];

export const XDR_PERMISSION_CATALOG: ReadonlySet<string> = new Set(
  Object.values(XdrPermissionNodes),
);

/** Held implicitly by every account, whatever its memberships say. */
export const DEFAULT_PERMISSION_GROUP = 'default';
export const ADMIN_PERMISSION_GROUP = 'admin';
