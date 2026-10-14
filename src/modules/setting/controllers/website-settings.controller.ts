import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedRequest } from '../../../common/interfaces/authenticated-request.interface';
import { RequirePermission } from '../../../common/decorators/permission.decorator';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { PermissionGuard } from '../../../common/guards/permission.guard';
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
  @UseGuards(AuthGuard, PermissionGuard)
  @RequirePermission('cms.settings.manage')
  manageList() {
    return this.settings.listManageable();
  }

  @Put('admin/:key')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, PermissionGuard)
  @RequirePermission('cms.settings.manage')
  update(
    @Param('key') key: string,
    @Body() input: SettingValueDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.settings.update(key, input.value, this.actor(request));
  }

  @Delete('admin/:key')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, PermissionGuard)
  @RequirePermission('cms.settings.manage')
  remove(@Param('key') key: string, @Req() request: AuthenticatedRequest) {
    return this.settings.remove(key, this.actor(request));
  }

  private actor(request: AuthenticatedRequest) {
    return {
      accountId: request.xdr_uid,
      playerId: null,
      requestId: request.requestId,
    };
  }
}
