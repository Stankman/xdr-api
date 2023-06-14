import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ArcturusSettingService } from "../services/arcturus-setting.service";
import { ArcturusSetting } from "../entities/arcturus-setting.entity";
import { AuthGuard } from "src/common/guards/auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { RolePermission } from "src/common/decorators/role-permission.decorator";

@ApiTags('Arcturus Settings')
@UseGuards(AuthGuard, RolesGuard)
@Controller('arcturus/settings')
export class ArcturusSettingsController {

    constructor(
        private readonly arcturusSettingService : ArcturusSettingService
    ) {}

    @RolePermission('manage-server')
    @Get()
    public async getSetting(
        @Query('key', new DefaultValuePipe('')) key : string
    ) : Promise<ArcturusSetting> {
        return this.arcturusSettingService.getSettingByKey(key);
    }
}