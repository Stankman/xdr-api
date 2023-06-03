import { Controller, DefaultValuePipe, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { XdrSettingService } from "../services/xdr-setting.service";
import { XdrSetting } from "../entities/xdr-setting.entity";
import { CustomResponse } from "src/common/models/custom-response.model";
import { custom } from "joi";

@ApiTags('Xdr Settings')
@Controller('settings')
export class XdrSettingsController {

    constructor(
        private readonly xdrSettingService : XdrSettingService
    ) {}

    @Get()
    public async getSetting(
        @Query('key', new DefaultValuePipe('')) key : string
    ) : Promise<XdrSetting> {
        return this.xdrSettingService.getSettingByKey(key);
    }
}