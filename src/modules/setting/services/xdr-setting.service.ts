import { Injectable } from "@nestjs/common";
import { XdrSettingsRepository } from "../repositories/xdr-settings.repository";

@Injectable()
export class XdrSettingService {
    constructor(
        private readonly repository : XdrSettingsRepository
    ) {}
}