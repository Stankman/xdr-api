import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ArcturusTextService } from "../services/arcturus-text.service";

@ApiTags('Arcturus Text')
@Controller('arcturus/texts')
export class ArcturusSettingsController {

    constructor(
        private readonly arcturusSettingService : ArcturusTextService
    ) {}
}