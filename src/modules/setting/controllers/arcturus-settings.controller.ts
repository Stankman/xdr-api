import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ArcturusSettingService } from "../services/arcturus-setting.service";

@ApiTags('Arcturus Settings')
@Controller('arcturus/settings')
export class ArcturusSettingsController {

    constructor(
        private readonly arcturusSettingService : ArcturusSettingService
    ) {}
}