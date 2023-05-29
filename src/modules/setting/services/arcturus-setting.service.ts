import { Injectable } from "@nestjs/common";
import { ArcturusSettingsRepository } from "../repositories/arcturus-settings.repository";

@Injectable()
export class ArcturusSettingService {
    constructor(
        private readonly repository : ArcturusSettingsRepository
    ) {}
}