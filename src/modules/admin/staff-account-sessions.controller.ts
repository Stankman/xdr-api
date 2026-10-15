import {
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { PositiveIntPipe } from '../../common/pipes/positive-int.pipe';
import { BoundedPagePipe } from '../../common/pipes/bounded-page.pipe';
import { StaffAccountSessionsService } from './staff-account-sessions.service';

@ApiTags('Administrative account sessions')
@ApiBearerAuth()
@Controller('admin/accounts/:accountId/sessions')
export class StaffAccountSessionsController {
  constructor(private readonly staffSessions: StaffAccountSessionsService) {}

  @Get()
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    minimum: 1,
    maximum: 100_000,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    minimum: 1,
    maximum: 100,
    example: 50,
  })
  @UseGuards(AuthGuard, PermissionGuard)
  @RequirePermission('cms.accounts.sessions.view')
  list(
    @Param('accountId', PositiveIntPipe) accountId: number,
    @Req() request: AuthenticatedRequest,
    @Query('page', BoundedPagePipe) page = 1,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit = 50,
  ) {
    return this.staffSessions.list(
      accountId,
      request.xdr_uid,
      null,
      this.requestId(request),
      page,
      limit,
    );
  }

  @Delete(':sessionId')
  @UseGuards(AuthGuard, PermissionGuard)
  @RequirePermission('cms.accounts.sessions.manage')
  revoke(
    @Param('accountId', PositiveIntPipe) accountId: number,
    @Param('sessionId', new ParseUUIDPipe()) sessionId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.staffSessions.revoke(
      accountId,
      sessionId,
      request.xdr_uid,
      null,
      this.requestId(request),
    );
  }

  private requestId(request: AuthenticatedRequest): string {
    return request.requestId || 'unknown';
  }
}
