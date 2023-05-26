import { Injectable } from "@nestjs/common";
import { AvatarsSettingsRepository } from "../repositories/avatars-settings.repository";

@Injectable()
export class AvatarSettingsService {
    constructor(
        private readonly repository : AvatarsSettingsRepository
    ) {}
}