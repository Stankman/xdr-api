import { ApiProperty } from '@nestjs/swagger';

export class PermissionGroupParentDto {
  @ApiProperty() id: number;
  @ApiProperty() name: string;
}

export class PermissionGroupSummaryDto {
  @ApiProperty() id: number;
  @ApiProperty() name: string;
  @ApiProperty() displayName: string;
  @ApiProperty() weight: number;
  @ApiProperty({ type: [PermissionGroupParentDto] })
  parents: PermissionGroupParentDto[];
  @ApiProperty() activeDirectMemberCount: number;
}

export class PermissionGroupsResponseDto {
  @ApiProperty({ example: 'ok' }) status: string;
  @ApiProperty({ example: 200 }) code: number;
  @ApiProperty({ type: [PermissionGroupSummaryDto] })
  data: PermissionGroupSummaryDto[];
}

export class PermissionGroupMemberAccountDto {
  @ApiProperty() id: number;
  @ApiProperty({ format: 'email' }) email: string;
  @ApiProperty() emailVerified: boolean;
}

export class PermissionGroupMembershipDto {
  @ApiProperty({ type: String, format: 'date-time' }) createdAt: Date;
  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  expiresAt: Date | null;
}

export class PermissionGroupMemberDto {
  @ApiProperty({ type: PermissionGroupMemberAccountDto })
  account: PermissionGroupMemberAccountDto;
  @ApiProperty({ type: PermissionGroupMembershipDto })
  membership: PermissionGroupMembershipDto;
}

export class PermissionGroupMembersMetaDto {
  @ApiProperty() itemCount: number;
  @ApiProperty() totalItems: number;
  @ApiProperty() itemsPerPage: number;
  @ApiProperty() totalPages: number;
  @ApiProperty() currentPage: number;
}

export class PermissionGroupMembersDataDto {
  @ApiProperty({ type: [PermissionGroupMemberDto] })
  items: PermissionGroupMemberDto[];
  @ApiProperty({ type: PermissionGroupMembersMetaDto })
  meta: PermissionGroupMembersMetaDto;
}

export class PermissionGroupMembersResponseDto {
  @ApiProperty({ example: 'ok' }) status: string;
  @ApiProperty({ example: 200 }) code: number;
  @ApiProperty({ type: PermissionGroupMembersDataDto })
  data: PermissionGroupMembersDataDto;
}
