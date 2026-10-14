export interface TurboAdminMe {
  id: number;
  name: string;
  sessionExpiresAtUtc: string;
  canManagePermissions: boolean;
  canResetPasskeys: boolean;
  canViewRooms: boolean;
  canViewPermissions: boolean;
  canViewPlayers: boolean;
  canViewCommandLog: boolean;
  canViewCatalog: boolean;
  canViewChatlog: boolean;
  canViewGamedata: boolean;
  canViewSettings: boolean;
  canViewContent: boolean;
}

export interface TurboPermissionCheck {
  node: string;
  isRegistered: boolean;
  granted: boolean;
}

export interface TurboPlayerSanction {
  kind: string;
  reason: string;
  issuerName: string | null;
  issuedUtc: string;
  expiresUtc: string | null;
  revokedUtc: string | null;
  revokedByName: string | null;
  isActive: boolean;
}

export interface TurboPlayerSummary {
  id: number;
  name: string;
  motto: string | null;
  isOnline: boolean;
  lastLoginUtc: string | null;
  joinedUtc: string;
  roomsOwned: number;
  discordUsername: string | null;
}

export interface TurboPlayerList {
  total: number;
  page: number;
  pageSize: number;
  onlineNow: number;
  players: TurboPlayerSummary[];
}

export interface TurboPlayerDetail {
  id: number;
  name: string;
  motto: string | null;
  figure: string;
  gender: string;
  isOnline: boolean;
  lastLoginUtc: string | null;
  joinedUtc: string;
  respectPoints: number;
  roomsOwned: number;
  sanctions: TurboPlayerSanction[];
}

export interface TurboRoomSummary {
  id: number;
  name: string;
  ownerId: number;
  ownerName: string;
  doorMode: string;
  playersMax: number;
  categoryName: string | null;
  isLoaded: boolean;
  population: number;
  lastActiveUtc: string;
}

export interface TurboRoomList {
  total: number;
  page: number;
  pageSize: number;
  rooms: TurboRoomSummary[];
}

export interface TurboTicketStatus {
  hasTicket: boolean;
  expiresAtUtc: string | null;
  reusable: boolean;
  expired: boolean;
}

export interface TurboIssuedTicket {
  ticket: string;
  expiresAtUtc: string | null;
  reusable: boolean;
  loginUrl: string | null;
}

export interface TurboIssueTicketRequest {
  lifetimeMinutes: number | null;
  reusable: boolean;
}

export interface TurboPlayerActionRequest {
  action: 'ban' | 'unban' | 'silence' | 'unsilence' | 'tradelock' | 'untradelock' | 'warn';
  duration?: string;
  reason?: string;
}

export interface TurboPermissionCatalog {
  nodes: Array<{
    node: string;
    description: string;
    clientLevel: number | null;
    grantedByDefault: boolean;
  }>;
  metaKeys: Array<{
    key: string;
    description: string;
  }>;
}

export interface TurboCatalogTree {
  rootId: number;
  pages: Array<{
    id: number;
    parentId: number | null;
    localization: string;
    name: string | null;
    icon: number;
    layout: string;
    display: string;
    sortOrder: number;
    offerCount: number;
  }>;
  canManage: boolean;
  unpublishedChanges: number;
  currencies: Array<{ id: number; name: string; code: string }>;
  layouts: string[];
  club: Record<string, unknown>;
}
