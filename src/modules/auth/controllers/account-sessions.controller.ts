import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AccountSummaryResponseDto } from '../../account/dtos/account-summary.dto';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { AuthenticatedRequest } from '../../../common/interfaces/authenticated-request.interface';
import { BoundedPagePipe } from '../../../common/pipes/bounded-page.pipe';
import { PasswordChangeDto } from '../dtos/password-change.dto';
import { AuthenticationService } from '../services/authentication.service';

@ApiTags('Account')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('account')
export class AccountSessionsController {
  constructor(private readonly authentication: AuthenticationService) {}

  @Get()
  @ApiOkResponse({ type: AccountSummaryResponseDto })
  current(@Req() request: AuthenticatedRequest) {
    return this.authentication.accountSummary(request.xdr_uid);
  }

  @Get('sessions')
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    minimum: 1,
    maximum: 100_000,
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, minimum: 1, maximum: 100, example: 50 })
  sessions(
    @Req() request: AuthenticatedRequest,
    @Query('page', BoundedPagePipe) page = 1,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit = 50,
  ) {
    return this.authentication.sessionsForAccount(request.xdr_uid, page, limit);
  }

  @Delete('sessions/:sessionId')
  revokeSession(
    @Req() request: AuthenticatedRequest,
    @Param('sessionId', new ParseUUIDPipe()) sessionId: string,
  ) {
    return this.authentication.revokeOwnedSession(request.xdr_uid, sessionId);
  }

  @Delete('sessions')
  revokeAll(@Req() request: AuthenticatedRequest) {
    return this.authentication.logoutAll(request.xdr_uid);
  }

  @Patch('password')
  changePassword(@Req() request: AuthenticatedRequest, @Body() input: PasswordChangeDto) {
    return this.authentication.changePassword(
      request.xdr_uid,
      input.currentPassword,
      input.newPassword,
    );
  }
}
