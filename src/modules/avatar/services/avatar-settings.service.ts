import { Injectable } from "@nestjs/common";
import { AvatarsSettingsRepository } from "../repositories/avatars-settings.repository";
import { AvatarSettings } from "../entities/avatar-settings.entity";

@Injectable()
export class AvatarSettingsService {
    constructor(
        private readonly repository : AvatarsSettingsRepository
    ) {}

    public async createAvatarSettings() : Promise<AvatarSettings> {
        return await this.getNewAvatarSettings();
    }

    public async save(settings : AvatarSettings) : Promise<AvatarSettings> {
        return this.repository.save(settings);
    }

    private async getNewAvatarSettings() : Promise<AvatarSettings> {
        let settings : AvatarSettings = new AvatarSettings();
        settings.allow_name_change = true;
        settings.can_trade = false;
        settings.block_following = false;
        settings.block_friendrequests = false;
        settings.block_roominvites = false;
        return settings;
    }
}