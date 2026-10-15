import { ApiProperty } from '@nestjs/swagger';

export class AccountAvatarCurrencyDto {
  @ApiProperty() user_id: number;
  @ApiProperty({ description: 'Turbo currency kind, not the definition ID.' })
  type: number;
  @ApiProperty() currencyTypeId: number;
  @ApiProperty({ type: Number, nullable: true }) activityPointType:
    number | null;
  @ApiProperty() amount: number;
}

export class AccountAvatarDto {
  @ApiProperty() id: number;
  @ApiProperty() username: string;
  @ApiProperty() look: string;
  @ApiProperty() motto: string;
  @ApiProperty() online: boolean;
  @ApiProperty({ format: 'date-time' }) created_at: string;
  @ApiProperty({ format: 'date-time' }) updated_at: string;
  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  gameLastLoginAt: string | null;
  @ApiProperty({
    description: 'Unix seconds; player creation time until first game login.',
  })
  lastLogin: number;
  @ApiProperty() credits: number;
  @ApiProperty({ type: [AccountAvatarCurrencyDto] })
  currencies: AccountAvatarCurrencyDto[];
}

export class AccountSummaryDto {
  @ApiProperty() id: number;
  @ApiProperty() email: string;
  @ApiProperty() emailVerified: boolean;
  @ApiProperty({ type: String, format: 'date-time' }) createdAt: Date;
  @ApiProperty({ type: [AccountAvatarDto] }) avatars: AccountAvatarDto[];
  @ApiProperty({ type: AccountAvatarDto, nullable: true })
  activeAvatar: AccountAvatarDto | null;
}

export class AccountSummaryResponseDto {
  @ApiProperty({ example: 'ok' }) status: string;
  @ApiProperty({ example: 200 }) code: number;
  @ApiProperty({ type: AccountSummaryDto }) data: AccountSummaryDto;
}

export class CurrentAccountDto extends AccountSummaryDto {
  @ApiProperty({
    type: [String],
    description:
      'Effective granted XDR permission nodes. Use for UI visibility only; API routes enforce permissions independently.',
    example: ['cms.articles.manage'],
  })
  permissions: string[];
}

export class CurrentAccountResponseDto {
  @ApiProperty({ example: 'ok' }) status: string;
  @ApiProperty({ example: 200 }) code: number;
  @ApiProperty({ type: CurrentAccountDto }) data: CurrentAccountDto;
}
