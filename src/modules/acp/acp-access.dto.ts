import { ApiProperty } from '@nestjs/swagger';

export class AcpAccessDto {
  @ApiProperty() canAccessAcp: boolean;
}

export class AcpAccessResponseDto {
  @ApiProperty({ example: 'ok' }) status: string;
  @ApiProperty({ example: 200 }) code: number;
  @ApiProperty({ type: AcpAccessDto }) data: AcpAccessDto;
}
