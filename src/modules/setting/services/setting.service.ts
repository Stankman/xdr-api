import { IPaginationOptions, Pagination, IPaginationMeta } from "nestjs-typeorm-paginate";
import { SettingsRepository } from "../repositories/settings.repository";

export class SettingService<T,K extends SettingsRepository<T>> {
    constructor(
        private readonly _repository : K
    ) {}

    public async saveSetting(setting : T) : Promise<T> {
        return this._repository.save(setting);
    }

    public get repository() {
        return this._repository;
    }
}