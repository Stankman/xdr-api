import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AuthenticatedRequest } from '../../../common/interfaces/authenticated-request.interface';
import { RequireTurboPermission } from '../../../common/decorators/turbo-permission.decorator';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { TurboAdminGuard } from '../../../common/guards/turbo-admin.guard';
import { TurboPermissionGuard } from '../../../common/guards/turbo-permission.guard';
import { SettingValueDto } from '../dtos/setting-value.dto';
import { WebsiteSettingsService } from '../services/website-settings.service';

@ApiTags('Website settings')
@Controller('settings')
export class WebsiteSettingsController {
  constructor(private readonly settings: WebsiteSettingsService) {}

  @Get('public')
  publicSettings() {
    return this.settings.publicSettings();
  }

  @Get('admin')
  @ApiBearerAuth()
  @ApiSecurity('TurboAdminToken')
  @ApiHeader({ name: 'X-Turbo-Admin-Token', required: true })
  @UseGuards(AuthGuard, TurboAdminGuard, TurboPermissionGuard)
  @RequireTurboPermission('cms.settings.manage')
  manageList() {
    return this.settings.listManageable();
  }

  @Put('admin/:key')
  @ApiBearerAuth()
  @ApiSecurity('TurboAdminToken')
  @ApiHeader({ name: 'X-Turbo-Admin-Token', required: true })
  @UseGuards(AuthGuard, TurboAdminGuard, TurboPermissionGuard)
  @RequireTurboPermission('cms.settings.manage')
  update(
    @Param('key') key: string,
    @Body() input: SettingValueDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.settings.update(key, input.value, this.actor(request));
  }

  @Delete('admin/:key')
  @ApiBearerAuth()
  @ApiSecurity('TurboAdminToken')
  @ApiHeader({ name: 'X-Turbo-Admin-Token', required: true })
  @UseGuards(AuthGuard, TurboAdminGuard, TurboPermissionGuard)
  @RequireTurboPermission('cms.settings.manage')
  remove(@Param('key') key: string, @Req() request: AuthenticatedRequest) {
    return this.settings.remove(key, this.actor(request));
  }

  private actor(request: AuthenticatedRequest) {
    if (!request.turbo_admin_player_id) {
      throw new ForbiddenException('Turbo Admin identity is required.');
    }
    return {
      accountId: request.xdr_uid,
      playerId: request.turbo_admin_player_id,
      requestId: request.requestId,
    };
  }
}
