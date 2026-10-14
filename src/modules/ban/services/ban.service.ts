import { Injectable } from "@nestjs/common";
import { IPaginationMeta, IPaginationOptions, Pagination } from "../../../common/pagination";
import { FindOptionsWhere, MoreThan } from "typeorm";
import { BanRepository } from "../repositories/ban.repository";
import { Ban } from "../entities/ban.entity";

@Injectable()
export class BanService {
    constructor(private readonly repository : BanRepository) {}


    public async paginateBans(options : IPaginationOptions) : Promise<Pagination<Ban, IPaginationMeta>> {
        return this.repository.paginate(options);
    }

    public async getBan(value : string | number, throwException : boolean = false) : Promise<Ban | null> {
        const currentTimestamp = Math.floor(new Date().getTime() / 1000);

        const whereOptions: FindOptionsWhere<Ban>[] = [
            { 
              ban_expire: MoreThan(currentTimestamp),
              user_id: !isNaN(Number(value)) ? Number(value) : 0,
            },
            { 
              ban_expire: MoreThan(currentTimestamp),
              ip: String(value),
            },
            { 
              ban_expire: MoreThan(currentTimestamp),
              machine_id: String(value)
            }
        ];

        return this.repository.getOneBy(whereOptions, [], throwException);
    }
}
