import { Controller, DefaultValuePipe, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ArcturusTextService } from "../services/arcturus-text.service";
import { ArcturusText } from "../entities/arcturus-text.entity";
import { RolePermission } from "src/common/decorators/role-permission.decorator";
import { RolesGuard } from "src/common/guards/roles.guard";
import { AuthGuard } from "src/common/guards/auth.guard";

@ApiTags('Arcturus Text')
@UseGuards(AuthGuard, RolesGuard)
@Controller('arcturus/texts')
export class ArcturusTextsController {

    constructor(
        private readonly arcturusTextService : ArcturusTextService
    ) {}

    @RolePermission('manage-server')
    @Get()
    public async getSetting(
        @Query('key', new DefaultValuePipe('')) key : string
    ) : Promise<ArcturusText> {
        return this.arcturusTextService.getSettingByKey(key);
    }
}