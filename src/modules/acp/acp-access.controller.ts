import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import { AcpAccessService } from './acp-access.service';
import { AcpAccessResponseDto } from './acp-access.dto';

@ApiTags('ACP access')
@UseGuards(AuthGuard)
@Controller()
export class AcpAccessController {
  constructor(private readonly acp: AcpAccessService) {}

  @Get('account/acp-access')
  @ApiBearerAuth()
  @ApiOkResponse({ type: AcpAccessResponseDto })
  eligibility(@Req() request: AuthenticatedRequest) {
    return this.acp.eligibility(request.xdr_uid);
  }
}
