import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
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
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { BoundedPagePipe } from '../../common/pipes/bounded-page.pipe';
import { PositiveIntPipe } from '../../common/pipes/positive-int.pipe';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import { XdrPermissionNodes } from './permission-nodes';
import { PermissionGroupsService } from './permission-groups.service';
import {
  PermissionGroupMembersResponseDto,
  PermissionGroupsResponseDto,
} from './permission-groups.dto';

@ApiTags('Administrative permission groups')
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard)
@RequirePermission(XdrPermissionNodes.PERMISSIONS_MANAGE)
@Controller('admin/permission-groups')
export class PermissionGroupsController {
  constructor(private readonly groups: PermissionGroupsService) {}

  @Get()
  @ApiOkResponse({ type: PermissionGroupsResponseDto })
  listGroups(@Req() request: AuthenticatedRequest) {
    return this.groups.listGroups(
      request.xdr_uid,
      request.requestId || 'unknown',
    );
  }

  @Get(':groupId/accounts')
  @ApiOkResponse({ type: PermissionGroupMembersResponseDto })
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
  listDirectMembers(
    @Param('groupId', PositiveIntPipe) groupId: number,
    @Req() request: AuthenticatedRequest,
    @Query('page', BoundedPagePipe) page = 1,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit = 50,
  ) {
    return this.groups.listDirectMembers(
      groupId,
      request.xdr_uid,
      request.requestId || 'unknown',
      page,
      limit,
    );
  }
}
