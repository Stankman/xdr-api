import { ApiProperty } from '@nestjs/swagger';

export class StaffMemberDto {
  @ApiProperty() username: string;
  @ApiProperty() look: string;
  @ApiProperty() motto: string;
  @ApiProperty() online: boolean;
}

export class StaffGroupDto {
  @ApiProperty() name: string;
  @ApiProperty() displayName: string;
  @ApiProperty() weight: number;
  @ApiProperty({ type: [StaffMemberDto] }) members: StaffMemberDto[];
}

export class StaffDirectoryResponseDto {
  @ApiProperty({ example: 'ok' }) status: string;
  @ApiProperty({ example: 200 }) code: number;
  @ApiProperty({ type: [StaffGroupDto] }) data: StaffGroupDto[];
}
