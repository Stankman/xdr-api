import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { XdrSettingService } from "../services/xdr-setting.service";

@ApiTags('Xdr Settings')
@Controller('settings')
export class XdrSettingsController {

    constructor(
        private readonly xdrSettingService : XdrSettingService
    ) {}
}