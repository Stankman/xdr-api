import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ArcturusSettingService } from "../services/arcturus-setting.service";
import { ArcturusSetting } from "../entities/arcturus-setting.entity";

@ApiTags('Arcturus Settings')
//TODO ADD GUARD
@Controller('arcturus/settings')
export class ArcturusSettingsController {

    constructor(
        private readonly arcturusSettingService : ArcturusSettingService
    ) {}

    @Get()
    public async getSetting(
        @Query('key', new DefaultValuePipe('')) key : string
    ) : Promise<ArcturusSetting> {
        return this.arcturusSettingService.getSettingByKey(key);
    }
}